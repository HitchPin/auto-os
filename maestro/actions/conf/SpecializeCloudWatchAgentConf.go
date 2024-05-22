package conf

import (
	"github.com/HitchPin/maestro/actions/util"
	"github.com/pkg/errors"
	"strings"
)

type SpecializeCloudWatchAgentConfInput struct {
	CommonProps util.CommonProps
	Role        string
}

type SpecializeCloudWatchAgentConfOutput struct {
	AgentConfJson string
}

func SpecializeCloudWatchAgentConf(input SpecializeCloudWatchAgentConfInput) (*SpecializeCloudWatchAgentConfOutput, error) {

	clusterName, err := getParamValue(input.CommonProps.AwsConf, input.CommonProps.ClusterNameParameterId)
	if err != nil {
		return nil, errors.Wrap(err, "Failed to fetch stage name.")
	}

	cwagentBytes, err := getStoredConfigBytes(input.CommonProps.AwsConf, input.CommonProps.ConfigBucket, input.CommonProps.ConfigPrefix+"cwagent.json")
	if err != nil {
		return nil, err
	}

	cwagentJson := string(cwagentBytes)

	cwagentJson = strings.ReplaceAll(cwagentJson, "%CLUSTER_LOG_GROUP_PREFIX%", *clusterName)
	cwagentJson = strings.ReplaceAll(cwagentJson, "%MAESTRO_ROLE%", input.Role)

	if err != nil {
		return nil, err
	}
	return &SpecializeCloudWatchAgentConfOutput{
		AgentConfJson: cwagentJson,
	}, nil
}
