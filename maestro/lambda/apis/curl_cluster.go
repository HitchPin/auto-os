package apis

import (
	"github.com/HitchPin/maestro/actions/meta"
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

type curlClusterInput struct {
	Method       string            `json:"method"`
	PathAndQuery string            `json:"pathAndQuery"`
	Headers      map[string]string `json:"headers"`
	Body         []byte            `json:"body"`
	HostOverride *string           `json:"hostOverride"`
}
type curlClusterOutput struct {
	Body       []byte            `json:"body"`
	StatusCode int               `json:"statusCode"`
	StatusText string            `json:"statusText"`
	Headers    map[string]string `json:"headers"`
}

func CurlClusterApi(ctx context.Context, req events.APIGatewayProxyRequest) (res events.APIGatewayProxyResponse,
	err error) {

	commonProps := ctx.Value("commonProps").(util.CommonProps)

	var reqInput curlClusterInput
	err = lmdrouter.UnmarshalRequest(req, true, &reqInput)
	if err != nil {
		slog.Error("Unmarshalling error %s!", err.Error())
		return lmdrouter.HandleError(errors.Wrap(err, "Unmarshalling error"))
	}

	actionRes, err := meta.CurlCluster(meta.CurlClusterInput{
		CommonProps:  commonProps,
		PathAndQuery: reqInput.PathAndQuery,
		HostOverride: reqInput.HostOverride,
		Method:       reqInput.Method,
		Headers:      reqInput.Headers,
	})

	if err != nil {
		return lmdrouter.HandleError(errors.Wrap(err, "Loading certificate"))
	}

	result := curlClusterOutput{
		Body:       actionRes.Body,
		StatusCode: actionRes.StatusCode,
		StatusText: actionRes.StatusText,
		Headers:    actionRes.Headers,
	}
	return lmdrouter.MarshalResponse(http.StatusOK, nil, result)
}
