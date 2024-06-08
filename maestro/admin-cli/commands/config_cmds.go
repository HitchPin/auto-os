package cli

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/MakeNowJust/heredoc"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
	"github.com/davecgh/go-spew/spew"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"gopkg.in/yaml.v3"
	"os"
)

func createInitCmd() *cobra.Command {
	var initCmd = &cobra.Command{
		Use:   "init name",
		Short: "Init a config file",
		Example: heredoc.Doc(`
			Create an empty config file for a specific use case.
			$ config init production
		`),
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			name := args[0]
			fmt.Println("Writing config file...")
			err := viper.WriteConfigAs(name + ".yml")
			if err != nil {
				return errors.Wrap(err, "Could not write config file!")
			}
			fmt.Println("Wrote config file.")
			return nil
		},
	}

	return initCmd
}

func createPrintCmd() *cobra.Command {
	var initCmd = &cobra.Command{
		Use:   "print",
		Short: "Print the loaded config",
		Example: heredoc.Doc(`
			Print the current config
			$ config print
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			c, err := GetMaestroConfig()
			if err != nil {
				return errors.Wrap(err, "Failed to load CLI config.")
			}
			str := spew.Sdump(c)
			fmt.Printf("Config:\n%s", str)
			return nil
		},
	}

	return initCmd
}

func createHydrateCommand() *cobra.Command {

	var substrateParam string
	var controlPlaneParam string
	var name string
	var id string
	var profile string
	var region string
	var useImmediately bool
	var hydrateCmd = &cobra.Command{
		Use:   "hydrate",
		Short: "Hydrate a config file",
		Example: heredoc.Doc(`
			Create a config file from the planar registrar parameters.
			$ config init production
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			optionFuncs := []func(*config.LoadOptions) error{}
			if cmd.Flags().Lookup("region").Changed {
				optionFuncs = append(optionFuncs, config.WithRegion(region))
			}
			if cmd.Flags().Lookup("profile").Changed {
				optionFuncs = append(optionFuncs, config.WithSharedConfigProfile(profile))
			}

			awsConf, err := config.LoadDefaultConfig(context.TODO(), optionFuncs...)

			ssmClient := ssm.NewFromConfig(awsConf)

			var (
				sb  *SubstrateBootstrap
				cpb *ControlPlaneBootstrap
			)

			if cmd.Flags().Lookup("substrateParam").Changed {
				sb, err = getSubstrateBootstrapFromId(*ssmClient, substrateParam)
				if err != nil {
					return err
				}
			} else {
				sb, err = getSubstrateBootstrap(*ssmClient, name, id)
				if err != nil {
					return err
				}
			}

			if cmd.Flags().Lookup("controlPlaneParam").Changed {
				cpb, err = getControlPlaneBootstrapFromId(*ssmClient, controlPlaneParam)
				if err != nil {
					return err
				}
			} else {
				cpb, err = getControlPlaneBootstrap(*ssmClient, name, id)
				if err != nil {
					return err
				}
			}

			c, err := GetMaestroConfig()
			c.Discovery.NamespaceName = sb.DiscoNamespaceName
			c.Discovery.ServiceId = cpb.DiscoServiceId
			c.Discovery.ServiceName = cpb.DiscoServiceName
			c.Certificates.CertificateAuthoritySecretId = cpb.CertificateAuthoritySecretId
			c.Certificates.KeySize = 2048
			c.Conf.ClusterAdminSecretId = cpb.ClusterAdminSecretId
			c.Conf.ClusterNameParameterId = cpb.ClusterNameParamId
			c.Conf.ClusterModeParameterId = cpb.ClusterModeParamId
			c.Conf.EventBusName = cpb.EventBusName
			c.Conf.EventLogGroupName = cpb.EventLogGroupName
			c.Conf.ConfigBucket = sb.ConfigBucketName
			c.Conf.ConfigPrefix = sb.ConfigBucketPrefix
			cfy, err := yaml.Marshal(c)
			if err != nil {
				return err
			}

			if useImmediately {
				err = os.WriteFile(".hp-maestro.yaml", cfy, 0644)
			} else {
				err = os.WriteFile("hydrated.hp-maestro.yaml", cfy, 0644)
			}

			if err != nil {
				return err
			}
			return nil
		},
	}
	hydrateCmd.Flags().StringVar(&substrateParam, "substrateParam", "", "--substrateParam")
	hydrateCmd.Flags().StringVar(&controlPlaneParam, "controlPlaneParam", "", "--controlPlaneParam")
	hydrateCmd.Flags().StringVarP(&name, "name", "n", "", "--az")
	hydrateCmd.Flags().StringVarP(&id, "id", "i", "", "--az")
	hydrateCmd.Flags().StringVar(&profile, "profile", "", "--profile")
	hydrateCmd.Flags().StringVar(&region, "region", "", "--region")
	hydrateCmd.Flags().BoolVar(&useImmediately, "useImmediately", false, "--useImmediately")

	return hydrateCmd
}

func ConfigCommand() *cobra.Command {
	var configCmd = &cobra.Command{
		Use: "config",
	}
	configCmd.AddCommand(createInitCmd())
	configCmd.AddCommand(createPrintCmd())
	configCmd.AddCommand(createHydrateCommand())
	return configCmd
}

func getControlPlaneBootstrap(ssmClient ssm.Client, clusterName string, clusterId string) (*ControlPlaneBootstrap, error) {
	id := "/" + clusterName + "-" + clusterId + "/controlPlane"
	return getControlPlaneBootstrapFromId(ssmClient, id)
}
func getControlPlaneBootstrapFromId(ssmClient ssm.Client, paramId string) (*ControlPlaneBootstrap, error) {
	res, err := ssmClient.GetParameter(context.TODO(), &ssm.GetParameterInput{
		Name: &paramId,
	})
	if err != nil {
		return nil, err
	}
	var j ControlPlaneBootstrap
	err = json.Unmarshal([]byte(*res.Parameter.Value), &j)
	if err != nil {
		return nil, err
	}
	return &j, err
}
func getSubstrateBootstrap(ssmClient ssm.Client, clusterName string, clusterId string) (*SubstrateBootstrap, error) {
	id := "/" + clusterName + "-" + clusterId + "/substrate"
	return getSubstrateBootstrapFromId(ssmClient, id)
}
func getSubstrateBootstrapFromId(ssmClient ssm.Client, paramId string) (*SubstrateBootstrap, error) {
	res, err := ssmClient.GetParameter(context.TODO(), &ssm.GetParameterInput{
		Name: &paramId,
	})
	if err != nil {
		return nil, err
	}
	var j SubstrateBootstrap
	err = json.Unmarshal([]byte(*res.Parameter.Value), &j)
	if err != nil {
		return nil, err
	}
	return &j, err
}

type ControlPlaneBootstrap struct {
	ClusterNameParamId           string
	ClusterModeParamId           string
	EventBusName                 string
	EventLogGroupName            string
	ClusterAdminSecretId         string
	CertificateAuthoritySecretId string
	DiscoServiceName             string
	DiscoServiceId               string
}
type SubstrateBootstrap struct {
	DiscoNamespaceId   string
	DiscoNamespaceName string
	ConfigBucketName   string
	ConfigBucketPrefix string
}
