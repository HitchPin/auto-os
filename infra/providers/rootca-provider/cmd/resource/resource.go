package resource

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"errors"
	"math/big"
	"time"

	"github.com/aws-cloudformation/cloudformation-cli-go-plugin/cfn/handler"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
)

func Create(req handler.Request, prevModel *Model, model *Model) (handler.ProgressEvent, error) {

	ca := &x509.Certificate{
		SerialNumber:          big.NewInt(2019),
		Subject:               model.Subject.ToPkixName(),
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(10, 0, 0),
		IsCA:                  true,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		BasicConstraintsValid: true,
	}

	caPrivKey, err := rsa.GenerateKey(rand.Reader, *model.KeySize)
	if err != nil {
		return handler.ProgressEvent{}, err
	}

	caBytes, err := x509.CreateCertificate(rand.Reader, ca, ca, &caPrivKey.PublicKey, caPrivKey)
	if err != nil {
		return handler.ProgressEvent{}, err
	}

	certPem, err := certBytesToPem(caBytes)
	if err != nil {
		return handler.ProgressEvent{}, err
	}

	keyPem, err := privKeyToPem(caPrivKey)
	if err != nil {
		return handler.ProgressEvent{}, err
	}

	smClient := secretsmanager.New(req.Session)
	res, err := smClient.CreateSecret(&secretsmanager.CreateSecretInput{
		Name:         model.PrivateKeySecretName,
		KmsKeyId:     model.PrivateKeyKmsKeyId,
		SecretString: keyPem,
	})
	if err != nil {
		return handler.ProgressEvent{}, err
	}

	model.PrivateKeySecretArn = res.ARN
	model.PublicCertificatePem = certPem
	ss := (ca.SerialNumber).Text(16)
	model.Serial = &ss

	return handler.ProgressEvent{
		OperationStatus: handler.Success,
		Message:         "Created CA Certificate.",
		ResourceModel:   model,
	}, nil
}

// Read handles the Read event from the Cloudformation service.
func Read(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {

	return handler.ProgressEvent{
		OperationStatus: handler.Success,
		ResourceModel:   currentModel,
	}, nil
}

func Update(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {

	return handler.ProgressEvent{}, errors.New("Not implemented: Update")
}

// Delete handles the Delete event from the Cloudformation service.
func Delete(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {

	smClient := secretsmanager.New(req.Session)
	_, err := smClient.DeleteSecret(&secretsmanager.DeleteSecretInput{
		SecretId: currentModel.PrivateKeySecretArn,
	})
	if err != nil {
		return handler.ProgressEvent{}, err
	}
	return handler.ProgressEvent{
		OperationStatus: handler.Success,
	}, nil
}

// List handles the List event from the Cloudformation service.
func List(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {

	return handler.ProgressEvent{}, errors.New("Not implemented: List")
}
