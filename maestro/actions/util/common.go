package util

import "github.com/aws/aws-sdk-go-v2/aws"

type CommonProps struct {
	AwsConf                      aws.Config
	CertificateAuthoritySecretId string
	ClusterAdminSecretId         string
	ClusterNameParameterId       string
	ClusterModeParameterId       string
	DiscoveryServiceName         string
	DiscoveryServiceId           string
	DiscoveryNamespaceName       string
	EventBusName                 string
	ConfigBucket                 string
	ConfigPrefix                 string
	LbName                       string
}
