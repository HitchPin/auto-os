package certs

import (
	"crypto/x509"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

type GetRootCAInput struct {
	CommonProps util.CommonProps
	Version     *string
}
type GetRootCAOutput struct {
	Certificate x509.Certificate
	SecretId    string
}

func GetRootCA(input GetRootCAInput) (*GetRootCAOutput, error) {

	var (
		cert *x509.Certificate
		err  error
	)

	smClient := secretsmanager.NewFromConfig(input.CommonProps.AwsConf)
	if input.Version == nil {
		cert, err = GetLatestCaCert(*smClient, input.CommonProps.CertificateAuthoritySecretId)
	} else {
		cert, err = GetCaCert(*smClient, input.CommonProps.CertificateAuthoritySecretId, input.Version)
	}

	if err != nil {
		return nil, err
	}
	return &GetRootCAOutput{
		Certificate: *cert,
	}, nil
}
