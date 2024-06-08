package conf

import (
	"fmt"
	"github.com/HitchPin/maestro/actions/certs"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/pkg/errors"
	"gopkg.in/yaml.v3"
	"os"
	"strings"
)

type Specifics struct {
	Hostname         string
	Role             string
	AvailabilityZone string
}
type SpecializeOpenSearchConfInput struct {
	CommonProps util.CommonProps

	Specificities Specifics
}

type SpecializeOpenSearchConfOutput struct {
	PreSecPluginOpenSearchYml string
	FinalOpenSearchYml        string
	SecurityYml               string
	InternalUsersYml          string
	RolesYml                  string
	RolesMappingYml           string
}

var roleToNodeRoles = map[string][]string{
	"bootstrapper":    {"cluster_manager", "data"},
	"cluster_manager": {"cluster_manager"},
	"data":            {"data"},
	"ingest":          {"ingest"},
	"ml":              {"ml"},
	"search":          {"search"},
	"voting_only":     {},
}

func SpecializeOpenSearchConf(input SpecializeOpenSearchConfInput) (*SpecializeOpenSearchConfOutput, error) {

	getRootCaRes, err := certs.GetRootCA(certs.GetRootCAInput{
		CommonProps: input.CommonProps,
	})
	if err != nil {
		return nil, errors.Wrap(err, "Failed to fetch root CA.")
	}
	caSubject := getRootCaRes.Certificate.Subject.String()
	cnPart := "CN=" + getRootCaRes.Certificate.Subject.CommonName
	caWithoutCnSubject := strings.Trim(strings.Replace(strings.Replace(caSubject, cnPart, "", 1), ",,", "", 1), ",")
	dnWildcard := "CN=*," + caWithoutCnSubject

	clusterName, err := getParamValue(input.CommonProps.AwsConf, input.CommonProps.ClusterNameParameterId)
	if err != nil {
		return nil, errors.Wrap(err, "Failed to fetch cluster name.")
	}

	baseConfig, err := getStoredYamlConfig(input, "opensearch.yml")
	if err != nil {
		return nil, err
	}

	specifics := input.Specificities
	osConf := *baseConfig
	osConf["plugins.security.nodes_dn"] = []string{
		dnWildcard,
	}
	osConf["plugins.security.authcz.admin_dn"] = []string{
		"UID=admin," + caWithoutCnSubject,
	}

	osConf["eventing.source"] = "maestro"
	osConf["eventing.dedupeQueueUrl"] = os.Getenv("EVENT_DEDUPE_QUEUE_URL")

	bootstrapping, err := IsClusterBootstrapping(input.CommonProps.AwsConf, input.CommonProps.ClusterModeParameterId)
	if err != nil {
		return nil, err
	}

	if *bootstrapping {

		anyNodes, err := discoverAnyNodes(input.CommonProps.AwsConf, input.CommonProps.DiscoveryNamespaceName, input.CommonProps.DiscoveryServiceName)
		if err != nil {
			return nil, err
		}

		if input.Specificities.Role == "bootstrapper" {
			osConf["cluster.initial_cluster_manager_nodes"] = []string{specifics.Hostname}
			osConf["discovery.seed_hosts"] = []string{}
		} else {
			bootstrapper, err := discoverBootstrapperNode(input.CommonProps.AwsConf, input.CommonProps.DiscoveryNamespaceName, input.CommonProps.DiscoveryServiceName)
			if err != nil {
				return nil, err
			}
			seedHosts := []string{*bootstrapper}
			for _, km := range anyNodes {
				if km != *bootstrapper {
					seedHosts = append(seedHosts, km)
				}
			}
			osConf["cluster.initial_cluster_manager_nodes"] = *bootstrapper
			osConf["discovery.seed_hosts"] = seedHosts
		}
	} else {
		if specifics.Role == "bootstrapper" {
			return nil, errors.New("Cluster is launched - nodes with bootstrapper role cannot be serviced.")
		}

		seedNodes, err := discoverAnyNodes(input.CommonProps.AwsConf, input.CommonProps.DiscoveryNamespaceName, input.CommonProps.DiscoveryServiceName)
		if err != nil {
			return nil, errors.Wrap(err, "Failed to find seed hosts.")
		}
		osConf["discovery.seed_hosts"] = seedNodes
	}

	osConf["node.name"] = specifics.Hostname
	osConf["node.attr.zone"] = specifics.AvailabilityZone
	osConf["node.attr.maestro_role"] = specifics.Role
	osConf["cluster.name"] = clusterName

	mappedRoles, ok := roleToNodeRoles[specifics.Role]
	if !ok {
		return nil, errors.New(fmt.Sprintf("No node role mapping for provided Maestro role %s.", specifics.Role))
	}
	osConf["node.roles"] = mappedRoles

	iu := NewInternalUsers()
	clusterAdminPwd, err := GetClusterAdminPwd(input.CommonProps.AwsConf, input.CommonProps.ClusterAdminSecretId)
	if err != nil {
		return nil, err
	}
	err = iu.AddUser(clusterAdminPwd.Username, clusterAdminPwd.Password, "admin")
	if err != nil {
		return nil, err
	}

	rolesBytes, err := getStoredConfigBytes(input.CommonProps.AwsConf, input.CommonProps.ConfigBucket, input.CommonProps.ConfigPrefix+"roles.yml")
	if err != nil {
		return nil, err
	}

	rolesMappingBytes, err := getStoredConfigBytes(input.CommonProps.AwsConf, input.CommonProps.ConfigBucket, input.CommonProps.ConfigPrefix+"roles_mapping.yml")
	if err != nil {
		return nil, err
	}

	secBytes, err := getStoredConfigBytes(input.CommonProps.AwsConf, input.CommonProps.ConfigBucket, input.CommonProps.ConfigPrefix+"security.yml")
	usersStr, err := iu.ToYaml()
	finalMs, err := yaml.Marshal(baseConfig)
	if err != nil {
		return nil, err
	}

	osConf["eventing.disabled"] = true
	preSecPluginYmlBytes, err := yaml.Marshal(osConf)

	return &SpecializeOpenSearchConfOutput{
		PreSecPluginOpenSearchYml: string(preSecPluginYmlBytes),
		FinalOpenSearchYml:        string(finalMs),
		InternalUsersYml:          *usersStr,
		SecurityYml:               string(secBytes),
		RolesYml:                  string(rolesBytes),
		RolesMappingYml:           string(rolesMappingBytes),
	}, nil
}
