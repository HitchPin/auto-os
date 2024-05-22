package conf

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
	"github.com/aws/aws-sdk-go-v2/service/servicediscovery"
	discoTypes "github.com/aws/aws-sdk-go-v2/service/servicediscovery/types"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
	"github.com/davecgh/go-spew/spew"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/yaml.v3"
	"io"
	"log"
)

type User struct {
	roles   []string
	name    string
	pwdHash string
}
type InternalUsers struct {
	users []User
}

func NewInternalUsers() InternalUsers {
	return InternalUsers{
		users: []User{},
	}
}

func (iu *InternalUsers) AddUser(name string, pwd string, roles ...string) error {
	pwdBytes := []byte(pwd)
	hash, err := bcrypt.GenerateFromPassword(pwdBytes, 12)
	if err != nil {
		return err
	}

	user := User{
		name:    name,
		pwdHash: string(hash),
		roles:   roles,
	}
	newUsers := append(iu.users, user)
	iu.users = newUsers
	fmt.Printf("Adding user %s to internal users map.\n", name)
	spew.Printf("%s", iu.users)
	return nil
}
func (iu InternalUsers) ToYaml() (*string, error) {
	yt := map[string]interface{}{
		"_meta": map[string]interface{}{
			"type":           "internalusers",
			"config_version": 2,
		},
	}
	spew.Printf("Serializing internal users %s.\n", iu)

	for _, user := range iu.users {
		fmt.Printf("Serializing user %s.\n", user.name)
		yt[user.name] = map[string]interface{}{
			"hash":                      user.pwdHash,
			"reserved":                  true,
			"opendistro_security_roles": []string{},
			"backend_roles":             user.roles,
		}
	}
	ms, err := yaml.Marshal(yt)
	if err != nil {
		return nil, err
	}
	msStr := string(ms)
	return &msStr, nil
}

type ClusterAdmin struct {
	Username string
	Password string
}

func GetClusterAdminPwd(awsConf aws.Config, secretId string) (*ClusterAdmin, error) {
	smClient := secretsmanager.NewFromConfig(awsConf)
	res, err := smClient.GetSecretValue(context.TODO(), &secretsmanager.GetSecretValueInput{
		SecretId: &secretId,
	})
	if err != nil {
		return nil, err
	}
	ss := *res.SecretString
	var ca ClusterAdmin
	err = json.Unmarshal([]byte(ss), &ca)
	if err != nil {
		return nil, err
	}
	return &ca, nil
}

func setClusterAdminPwd(smClient secretsmanager.Client, secretId string, creds ClusterAdmin) (*string, error) {
	credsJsonBytes, err := json.Marshal(creds)
	if err != nil {
		return nil, err
	}
	credsJson := string(credsJsonBytes)
	res, err := smClient.PutSecretValue(context.TODO(), &secretsmanager.PutSecretValueInput{
		SecretId:     &secretId,
		SecretString: &credsJson,
	})
	if err != nil {
		return nil, err
	}
	return res.VersionId, nil
}

func getParamValue(awsConf aws.Config, paramName string) (*string, error) {

	ssmClient := ssm.NewFromConfig(awsConf)
	res, err := ssmClient.GetParameter(context.TODO(), &ssm.GetParameterInput{
		Name: &paramName,
	})
	if err != nil {
		return nil, err
	}
	return res.Parameter.Value, nil
}

func getStoredConfigBytes(awsConf aws.Config, bucket string, key string) ([]byte, error) {

	s3client := s3.NewFromConfig(awsConf)
	s3bs, err := getS3Bytes(*s3client, bucket, key)
	if err != nil {
		return nil, err
	}

	return *s3bs, nil
}

func getStoredYamlConfig(input SpecializeOpenSearchConfInput, name string) (*map[string]interface{}, error) {

	s3bs, err := getStoredConfigBytes(input.CommonProps.AwsConf, input.CommonProps.ConfigBucket, input.CommonProps.ConfigPrefix+name)

	t := map[string]interface{}{}
	err = yaml.Unmarshal(s3bs, &t)
	if err != nil {
		return nil, err
	}

	return &t, nil
}

func getS3Bytes(s3client s3.Client, bucket string, key string) (*[]byte, error) {
	result, err := s3client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: &bucket,
		Key:    &key,
	})
	if err != nil {
		log.Printf("Couldn't get object %v:%v. Here's why: %v\n", bucket, key, err)
		return nil, err
	}
	defer result.Body.Close()
	body, err := io.ReadAll(result.Body)
	if err != nil {
		log.Printf("Couldn't read object body. Here's why: %v\n", err)
	}

	return &body, nil
}

func discoverAnyNodes(awsConf aws.Config, nsName string, svcName string) ([]string, error) {
	disco := servicediscovery.NewFromConfig(awsConf)
	dRes, err := disco.DiscoverInstances(context.TODO(), &servicediscovery.DiscoverInstancesInput{
		NamespaceName: &nsName,
		ServiceName:   &svcName,
	})
	if err != nil {
		return nil, err
	}

	return getNodes(*dRes), nil
}

func discoverBootstrapperNode(awsConf aws.Config, nsName string, svcName string) (*string, error) {

	nodes, err := discoverNodesWithRole(awsConf, nsName, svcName, "bootstrapper")
	if err != nil {
		return nil, err
	}
	if len(nodes) == 0 {
		return nil, errors.New("No bootstrapper nodes found.")
	}
	bn := nodes[0]
	return &bn, nil
}

func discoverNodesWithRole(awsConf aws.Config, nsName string, svcName string, role string) ([]string, error) {
	disco := servicediscovery.NewFromConfig(awsConf)
	dRes, err := disco.DiscoverInstances(context.TODO(), &servicediscovery.DiscoverInstancesInput{
		NamespaceName: &nsName,
		ServiceName:   &svcName,
		QueryParameters: map[string]string{
			"Role": role,
		},
	})
	if err != nil {
		return nil, err
	}

	for _, i := range dRes.Instances {
		fmt.Printf("Found instance %s with node name %s for role %s.\n", *i.InstanceId, i.Attributes["Hostname"], role)
	}

	return getNodes(*dRes), nil
}

func getNodes(io servicediscovery.DiscoverInstancesOutput) []string {

	nodes := []string{}
	for _, i := range io.Instances {
		ri := getRegisteredInstance(i)
		fmt.Printf("Extracted node instanceId = %s, hostname = %s, role = %s, cluster = %s.\n", ri.InstanceId, ri.Hostname, ri.Role, ri.Cluster)
		nodes = append(nodes, ri.Hostname)
	}

	fmt.Printf("Extracted nodes: %s.\n", nodes)
	return nodes
}

func getRegisteredInstance(i discoTypes.HttpInstanceSummary) RegisteredInstance {
	ri := RegisteredInstance{
		InstanceId: *i.InstanceId,
	}
	for k, v := range i.Attributes {
		if k == "Role" {
			ri.Role = v
		} else if k == "Hostname" {
			ri.Hostname = v
		} else if k == "Cluster" {
			ri.Cluster = v
		} else if k == "AWS_INSTANCE_IPV4" {
			ri.IpAddress = v
		}
	}
	return ri
}

func IsClusterBootstrapping(awsConf aws.Config, paramName string) (*bool, error) {

	ssmClient := ssm.NewFromConfig(awsConf)
	res, err := ssmClient.GetParameter(context.TODO(), &ssm.GetParameterInput{
		Name: &paramName,
	})
	if err != nil {
		return nil, err
	}
	pVal := *res.Parameter.Value
	bootstrapping := pVal == "bootstrapping"
	return &bootstrapping, nil
}

type RegisteredInstance struct {
	Cluster    string
	IpAddress  string
	Hostname   string
	InstanceId string
	Role       string
}
