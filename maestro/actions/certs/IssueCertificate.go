package certs

import (
	"github.com/HitchPin/maestro/actions/util"
	"github.com/HitchPin/maestro/certs"
	"github.com/HitchPin/maestro/certs/models"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

type IssueCertificateInput struct {
	CommonProps    util.CommonProps
	KeySize        int
	Subject        models.Subject
	ForServer      bool
	ForClient      bool
	AlternateNames *models.AlternativeNames
	ForAdmin       bool
}

type IssueCertificateOutput struct {
	CertificatePem string
	PrivateKeyPem  string
}

func IssueCertificate(input IssueCertificateInput) (*IssueCertificateOutput, error) {

	smClient := secretsmanager.NewFromConfig(input.CommonProps.AwsConf)
	signer, caCert, err := NewCertSigner(*smClient, input.CommonProps.CertificateAuthoritySecretId)
	if err != nil {
		return nil, err
	}

	caSub := caCert.Subject

	finalSubject := models.Subject{
		CommonName:         input.Subject.CommonName,
		Organization:       &caSub.Organization[0],
		Country:            &caSub.Country[0],
		State:              &caSub.Province[0],
		City:               &caSub.Locality[0],
		OrganizationalUnit: input.Subject.OrganizationalUnit,
	}

	if input.ForAdmin {
		uid := "admin"
		finalSubject.Uid = &uid
		finalSubject.CommonName = nil
		finalSubject.OrganizationalUnit = nil
	}
	req := models.NewCertificateRequest{
		Subject: finalSubject,
		Key: models.KeySettings{
			KeySize: input.KeySize,
		},
		IsForServer: input.ForServer,
		IsForClient: input.ForClient,
	}

	if input.AlternateNames != nil {
		req.SubjectAlternateNames = input.AlternateNames
	}

	cert, err := certs.NewCert(req, *signer)
	if err != nil {
		return nil, err
	}

	finalCert := IssueCertificateOutput{
		CertificatePem: cert.CertPem,
		PrivateKeyPem:  cert.KeyPem,
	}
	return &finalCert, nil
}
