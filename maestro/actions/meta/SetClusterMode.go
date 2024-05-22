package meta

import (
	"context"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
)

type SetClusterModeInput struct {
	CommonProps   util.CommonProps
	Bootstrapping bool
}
type SetClusterModeOutput struct {
	ParamValue string
}

func SetClusterMode(input SetClusterModeInput) (*SetClusterModeOutput, error) {

	val, err := setClusterMode(input.CommonProps.AwsConf, input.Bootstrapping, input.CommonProps.ClusterModeParameterId)
	if err != nil {
		return nil, err
	}
	return &SetClusterModeOutput{
		ParamValue: *val,
	}, nil
}

func setClusterMode(conf aws.Config, bootstrapping bool, paramName string) (*string, error) {
	var paramVal string
	if bootstrapping {
		paramVal = "bootstrapping"
	} else {
		paramVal = "launched"
	}
	overwrite := true
	ssmClient := ssm.NewFromConfig(conf)
	_, err := ssmClient.PutParameter(context.TODO(), &ssm.PutParameterInput{
		Name:      &paramName,
		Value:     &paramVal,
		Overwrite: &overwrite,
	})
	if err != nil {
		return nil, err
	}
	return &paramVal, nil
}
