package certs

import (
	"crypto/x509"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/HitchPin/maestro/certs"
	"github.com/HitchPin/maestro/certs/models"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

type GenerateRootCAInput struct {
	KeySize     int
	Subject     models.Subject
	CommonProps util.CommonProps
}

type GenerateRootCAOutput struct {
	Version     string
	Certificate x509.Certificate
}

func GenerateRootCA(input GenerateRootCAInput) (*GenerateRootCAOutput, error) {

	req := models.NewCARequest{
		Subject: input.Subject,
		Key: models.KeySettings{
			KeySize: input.KeySize,
		},
	}

	result, err := certs.NewCaCert(req)
	if err != nil {
		return nil, err
	}

	smClient := secretsmanager.NewFromConfig(input.CommonProps.AwsConf)
	version, err := SaveCertToSecret(*smClient, input.CommonProps.CertificateAuthoritySecretId, *result)

	return &GenerateRootCAOutput{
		Version:     *version,
		Certificate: result.Cert,
	}, nil
}
