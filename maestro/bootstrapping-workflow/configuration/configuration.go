package configuration

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
	"github.com/pkg/errors"
	"sync"
)

var (
	clusterName     string
	clusterNameOnce sync.Once

	clusterMode     string
	clusterModeOnce sync.Once
)

type CloudConf struct {
	AwsConf aws.Config
	Region  string
}
type Parameters struct {
	ClusterName string
	ClusterMode string
}
type ExecutionConfiguration struct {
	Stage          string
	Cloud          CloudConf
	Params         Parameters
	EventsLogGroup string
}

func (p ExecutionConfiguration) GetClusterName() string {
	clusterNameOnce.Do(func() {
		clusterName = getParamValue(p, p.Params.ClusterName)
	})
	return clusterName
}
func (p ExecutionConfiguration) GetClusterMode() string {
	clusterModeOnce.Do(func() {
		clusterMode = getParamValue(p, p.Params.ClusterMode)
	})
	return clusterMode
}

func getParamValue(p ExecutionConfiguration, paramId string) string {
	ssmClient := ssm.NewFromConfig(p.Cloud.AwsConf)
	res, err := ssmClient.GetParameter(context.TODO(), &ssm.GetParameterInput{
		Name: &paramId,
	})
	if err != nil {
		panic(errors.Wrap(err, fmt.Sprintf("Unable to get value for param %s.", paramId)))
	}
	return *res.Parameter.Value
}
