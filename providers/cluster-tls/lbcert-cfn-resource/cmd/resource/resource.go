package resource

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"github.com/aws/aws-sdk-go/service/acm"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
	"github.com/pkg/errors"
	"log"
	"math/big"
	"time"

	"github.com/aws-cloudformation/cloudformation-cli-go-plugin/cfn/handler"
)

// Create handles the Create event from the Cloudformation service.
func Create(req handler.Request, prevModel *Model, model *Model) (handler.ProgressEvent, error) {

	smClient := secretsmanager.New(req.Session)
	secretId := model.RootCASecretId
	material, err := GetRootCAMaterial(*smClient, *secretId)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Failed to load root CA cert material.")
	}
	signer, caCert, err := NewCertSigner(*material)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Failed to create cert signer.")
	}
	max := new(big.Int)
	max.Exp(big.NewInt(2), big.NewInt(20), nil).Sub(max, big.NewInt(1))
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to generate serial.")
	}
	log.Printf("Serial: " + n.Text(10))

	var usage x509.KeyUsage = x509.KeyUsageDigitalSignature |
		x509.KeyUsageKeyEncipherment |
		x509.KeyUsageDataEncipherment |
		x509.KeyUsageCRLSign |
		x509.KeyUsageCertSign
	extKeyUsage := []x509.ExtKeyUsage{
		x509.ExtKeyUsageServerAuth,
	}
	sub := Subject{
		CommonName:   model.CommonName,
		Organization: &caCert.Subject.Organization[0],
		Country:      &caCert.Subject.Country[0],
		State:        &caCert.Subject.Province[0],
		City:         &caCert.Subject.Locality[0],
	}

	var (
		keySize        int
		expirationDays int
	)
	if model.KeySize != nil {
		keySize = *model.KeySize
	} else {
		keySize = 2048
	}
	if model.ExpirationDays != nil {
		expirationDays = *model.ExpirationDays
	} else {
		expirationDays = 3650
	}

	cert := &x509.Certificate{
		SerialNumber: n,
		Subject:      sub.ToPkixName(),
		NotBefore:    time.Now(),
		NotAfter:     time.Now().AddDate(0, 0, expirationDays),
		ExtKeyUsage:  extKeyUsage,
		KeyUsage:     usage,
		DNSNames: []string{
			*model.CommonName,
		},
	}

	certPrivKey, err := rsa.GenerateKey(rand.Reader, keySize)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to generate key.")
	}

	s := *signer
	certBytes, err := s(*cert, certPrivKey.PublicKey)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to sign certificate.")
	}

	certPem, err := certBytesToPem(certBytes)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to serialize certificate to PEM.")
	}

	keyPem, err := privKeyToPem(certPrivKey)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to serialize key to PEM.")
	}

	acmClient := acm.New(req.Session)
	importRes, err := acmClient.ImportCertificate(&acm.ImportCertificateInput{
		Certificate:      []byte(*certPem),
		PrivateKey:       []byte(*keyPem),
		CertificateChain: []byte(material.PublicKeyPem),
	})

	model.AcmCertificateId = importRes.CertificateArn
	return handler.ProgressEvent{
		OperationStatus: handler.Success,
		Message:         "Created LB certificate.",
		ResourceModel:   model,
	}, nil
}

// Read handles the Read event from the Cloudformation service.
func Read(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {

	return handler.ProgressEvent{
		OperationStatus: handler.Success,
		ResourceModel:   currentModel,
		Message:         "Read LB certificate.",
	}, nil
}

// Update handles the Update event from the Cloudformation service.
func Update(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {
	return handler.ProgressEvent{}, errors.New("Not implemented: Update")
}

// Delete handles the Delete event from the Cloudformation service.
func Delete(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {

	return handler.ProgressEvent{
		OperationStatus: handler.Success,
	}, nil
}

// List handles the List event from the Cloudformation service.
func List(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {

	log.Printf("Received list request!")

	return handler.ProgressEvent{
		OperationStatus: handler.Success,
		Message:         "List Complete",
		ResourceModel:   currentModel,
	}, nil
}
