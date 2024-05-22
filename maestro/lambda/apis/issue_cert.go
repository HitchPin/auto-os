package apis

import (
	"context"
	"github.com/HitchPin/maestro/actions/certs"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/HitchPin/maestro/certs/models"
	"github.com/aquasecurity/lmdrouter"
	"github.com/aws/aws-lambda-go/events"
	"github.com/pkg/errors"
	"log/slog"
	"net/http"
)

type issueCertInput struct {
	Server bool
	Client bool
	Admin  bool
	Name   string
	Usage  string
}
type issueCertOutput struct {
	Cert string
	Key  string
}

func IssueCertApi(ctx context.Context, req events.APIGatewayProxyRequest) (res events.APIGatewayProxyResponse,
	err error) {

	commonProps := ctx.Value("commonProps").(util.CommonProps)

	var reqInput issueCertInput
	err = lmdrouter.UnmarshalRequest(req, true, &reqInput)
	if err != nil {
		slog.Error("Unmarshalling error %s!", err.Error())
		return lmdrouter.HandleError(errors.Wrap(err, "Unmarshalling error"))
	}

	sub := models.Subject{
		CommonName: &reqInput.Name,
	}
	if len(reqInput.Usage) > 0 {
		sub.OrganizationalUnit = &reqInput.Usage
	}

	actionRes, err := certs.IssueCertificate(certs.IssueCertificateInput{
		CommonProps: commonProps,
		Subject:     sub,
		KeySize:     2048,
		ForServer:   reqInput.Server,
		ForClient:   reqInput.Client,
		ForAdmin:    reqInput.Admin,
	})
	if err != nil {
		return lmdrouter.HandleError(errors.Wrap(err, "Issuing certificate"))
	}
	slog.Info("Got info: ", "Subject", actionRes.CertificatePem)

	if err != nil {
		return lmdrouter.HandleError(errors.Wrap(err, "Loading certificate"))
	}

	result := issueCertOutput{
		Cert: actionRes.CertificatePem,
		Key:  actionRes.PrivateKeyPem,
	}
	return lmdrouter.MarshalResponse(http.StatusOK, nil, result)
}
