package meta

import (
	"context"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
)

type GetClusterModeInput struct {
	CommonProps util.CommonProps
}
type GetClusterModeOutput struct {
	Bootstrapping bool
}

func GetClusterMode(input GetClusterModeInput) (*GetClusterModeOutput, error) {

	ssmClient := ssm.NewFromConfig(input.CommonProps.AwsConf)
	res, err := ssmClient.GetParameter(context.TODO(), &ssm.GetParameterInput{
		Name: &input.CommonProps.ClusterModeParameterId,
	})
	if err != nil {
		return nil, err
	}
	pVal := *res.Parameter.Value
	bootstrapping := pVal == "bootstrapping"

	return &GetClusterModeOutput{
		Bootstrapping: bootstrapping,
	}, nil
}
