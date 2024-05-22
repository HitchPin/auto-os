package apis

import (
	"github.com/HitchPin/maestro/actions/util"
	c "github.com/HitchPin/maestro/certs"
	"github.com/aquasecurity/lmdrouter"
	"github.com/aws/aws-lambda-go/events"
	"github.com/pkg/errors"
	"log/slog"
	"net/http"
	"time"
)
import (
	"context"
	"github.com/HitchPin/maestro/actions/certs"
	"math/big"
)

type getRootCaInput struct {
	Version *string `lambda:"query.version"` // a query parameter named "show_something"
}
type getRootCaOutput struct {
	Subject    string
	CertPem    string
	Serial     string
	Expiration string
}

func GetRootCaApi(ctx context.Context, req events.APIGatewayProxyRequest) (res events.APIGatewayProxyResponse,
	err error) {

	commonProps := ctx.Value("commonProps").(util.CommonProps)

	var reqInput getRootCaInput
	err = lmdrouter.UnmarshalRequest(req, false, &reqInput)
	if err != nil {
		slog.Error("Unmarshalling error %s!", err.Error())
		return lmdrouter.HandleError(errors.Wrap(err, "Unmarshalling error"))
	}

	slog.Info("Fetching root CA", "Version", reqInput.Version)
	actionRes, err := certs.GetRootCA(certs.GetRootCAInput{
		CommonProps: commonProps,
		Version:     reqInput.Version,
	})
	slog.Info("Got info: ", "Subject", actionRes.Certificate.Subject.String())

	if err != nil {
		return lmdrouter.HandleError(errors.Wrap(err, "Loading certificate"))
	}

	cert := actionRes.Certificate
	bs, err := c.CertBytesToPem(cert.Raw)
	var bytesStr string
	bytesStr = *bs
	if err != nil {
		return lmdrouter.HandleError(errors.Wrap(err, "Serializing certificate"))
	}

	var serial big.Int
	serial = *cert.SerialNumber
	result := getRootCaOutput{
		Subject:    cert.Subject.String(),
		Serial:     serial.String(),
		Expiration: cert.NotAfter.Format(time.RFC3339),
		CertPem:    bytesStr,
	}
	return lmdrouter.MarshalResponse(http.StatusOK, nil, result)
}
