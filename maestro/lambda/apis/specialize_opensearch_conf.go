package apis

import (
	"fmt"
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

type specializeOpenSearchInput struct {
	Hostname         string `json:"host"`
	Role             string `json:"role"`
	AvailabilityZone string `json:"az"`
}
type specializeOpenSearchOutput struct {
	PreSecPluginOpenSearchYml string
	FinalOpenSearchYml        string
	InternalUsersYml          string
	SecurityYml               string
	RolesYml                  string
	RolesMappingYml           string
}

func SpecializeOpenSearchApi(ctx context.Context, req events.APIGatewayProxyRequest) (res events.APIGatewayProxyResponse,
	err error) {
	commonProps := ctx.Value("commonProps").(util.CommonProps)

	var reqInput specializeOpenSearchInput
	err = lmdrouter.UnmarshalRequest(req, true, &reqInput)
	if err != nil {
		slog.Error("Unmarshalling error %s!", err.Error())
		return lmdrouter.HandleError(errors.Wrap(err, "Unmarshalling error"))
	}

	fmt.Printf("Received a request for bespoke config for %s, %s, %s",
		reqInput.Hostname, reqInput.AvailabilityZone, reqInput.Role)

	result, err := conf.SpecializeOpenSearchConf(conf.SpecializeOpenSearchConfInput{
		Specificities: conf.Specifics{
			Hostname:         reqInput.Hostname,
			AvailabilityZone: reqInput.AvailabilityZone,
			Role:             reqInput.Role,
		},
		CommonProps: commonProps,
	})
	if err != nil {
		return lmdrouter.HandleError(errors.Wrap(err, "Loading certificate"))
	}

	finalResult := specializeOpenSearchOutput{
		PreSecPluginOpenSearchYml: result.PreSecPluginOpenSearchYml,
		FinalOpenSearchYml:        result.FinalOpenSearchYml,
		InternalUsersYml:          result.InternalUsersYml,
		SecurityYml:               result.SecurityYml,
		RolesYml:                  result.RolesYml,
		RolesMappingYml:           result.RolesMappingYml,
	}
	return lmdrouter.MarshalResponse(http.StatusOK, nil, finalResult)
}
