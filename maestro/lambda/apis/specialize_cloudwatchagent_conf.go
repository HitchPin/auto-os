package apis

import (
	"github.com/HitchPin/maestro/actions/conf"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/aquasecurity/lmdrouter"
	"github.com/aws/aws-lambda-go/events"
	"github.com/pkg/errors"
	"log/slog"
	"net/http"
)
import (
	"context"
)

type specializeCloudWatchAgentInput struct {
	Role string `json:"role"`
}
type specializeCloudWatchAgentOutput struct {
	AgentConfJson string
}

func SpecializeCloudWatchAgentApi(ctx context.Context, req events.APIGatewayProxyRequest) (res events.APIGatewayProxyResponse,
	err error) {
	commonProps := ctx.Value("commonProps").(util.CommonProps)

	var reqInput specializeCloudWatchAgentInput
	err = lmdrouter.UnmarshalRequest(req, true, &reqInput)
	if err != nil {
		slog.Error("Unmarshalling error %s!", err.Error())
		return lmdrouter.HandleError(errors.Wrap(err, "Unmarshalling error"))
	}

	result, err := conf.SpecializeCloudWatchAgentConf(conf.SpecializeCloudWatchAgentConfInput{
		CommonProps: commonProps,
		Role:        reqInput.Role,
	})
	if err != nil {
		return lmdrouter.HandleError(errors.Wrap(err, "Specializing config"))
	}

	finalResult := specializeCloudWatchAgentOutput{
		AgentConfJson: result.AgentConfJson,
	}
	return lmdrouter.MarshalResponse(http.StatusOK, nil, finalResult)
}
