package meta

import (
	"context"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
)

type GetClusterNameInput struct {
	CommonProps util.CommonProps
}
type GetClusterNameOutput struct {
	ClusterName string
}

func GetClusterName(input GetClusterNameInput) (*GetClusterNameOutput, error) {

	ssmClient := ssm.NewFromConfig(input.CommonProps.AwsConf)
	res, err := ssmClient.GetParameter(context.TODO(), &ssm.GetParameterInput{
		Name: &input.CommonProps.ClusterNameParameterId,
	})
	if err != nil {
		return nil, err
	}
	cn := res.Parameter.Value
	return &GetClusterNameOutput{
		ClusterName: *cn,
	}, nil
}
