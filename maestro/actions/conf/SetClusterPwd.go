package conf

import (
	"github.com/HitchPin/maestro/actions/util"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

type SetClusterPwdInput struct {
	CommonParams util.CommonProps
	Username     string
	Password     string
}

type SetClusterPwdOutput struct {
	Version string
}

func SetClusterPwd(input SetClusterPwdInput) (*SetClusterPwdOutput, error) {

	sm := secretsmanager.NewFromConfig(input.CommonParams.AwsConf)
	version, err := setClusterAdminPwd(*sm, input.CommonParams.ClusterAdminSecretId, ClusterAdmin{
		Username: input.Username,
		Password: input.Password,
	})
	if err != nil {
		return nil, err
	}
	return &SetClusterPwdOutput{
		Version: *version,
	}, nil
}
