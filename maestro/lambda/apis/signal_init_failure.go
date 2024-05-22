package apis

import (
	"fmt"
	meta2 "github.com/HitchPin/maestro/actions/signal"
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

type signalInitFailureInput struct {
	InstanceId   string
	DebugMessage *string
}
type signalInitFailureOutput struct {
	EventId string
}

func SignalInitFailureApi(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	commonProps := ctx.Value("commonProps").(util.CommonProps)

	var (
		reqInput signalInitFailureInput
		err      error
	)

	err = lmdrouter.UnmarshalRequest(req, true, &reqInput)
	if err != nil {
		slog.Error("Unmarshalling error %s!", err.Error())
		return lmdrouter.HandleError(errors.Wrap(err, "Unmarshalling error"))
	}

	res, err := meta2.SignalInitFailure(meta2.SignalInitFailureInput{
		CommonProps:  commonProps,
		InstanceId:   reqInput.InstanceId,
		DebugMessage: *reqInput.DebugMessage,
	})

	if err != nil {
		return lmdrouter.HandleError(errors.Wrap(err, "Publishing event"))
	}
	fmt.Printf("Published failure event %s.\n", res.EventId)

	result := signalInitFailureOutput{
		EventId: res.EventId,
	}
	return lmdrouter.MarshalResponse(http.StatusOK, nil, result)
}
