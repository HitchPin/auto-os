package apis

import (
	"fmt"
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

type registerInstanceInput struct {
	InstanceId *string
}
type registerInstanceOutput struct {
	RegistrationId string
}

func RegisterInstanceApi(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	commonProps := ctx.Value("commonProps").(util.CommonProps)

	var (
		reqInput registerInstanceInput
		err      error
	)

	err = lmdrouter.UnmarshalRequest(req, true, &reqInput)
	if err != nil {
		slog.Error("Unmarshalling error %s!", err.Error())
		return lmdrouter.HandleError(errors.Wrap(err, "Unmarshalling error"))
	}

	res, err := meta.RegisterInstance(meta.RegisterInstanceInput{
		CommonParams: commonProps,
		InstanceId:   *reqInput.InstanceId,
	})
	fmt.Printf("Registered instance with id %s.\n", res.RegistrationId)

	if err != nil {
		return lmdrouter.HandleError(errors.Wrap(err, "Registering instance"))
	}

	result := registerInstanceOutput{
		RegistrationId: res.RegistrationId,
	}
	return lmdrouter.MarshalResponse(http.StatusOK, nil, result)
}
