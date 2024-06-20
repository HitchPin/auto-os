package resource

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"log"
	"math/big"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/pkg/errors"

	"github.com/aws-cloudformation/cloudformation-cli-go-plugin/cfn/handler"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
)

// Create handles the Create event from the Cloudformation service.
func Create(req handler.Request, prevModel *Model, model *Model) (handler.ProgressEvent, error) {

	log.Printf("Subject: \n%s\n", spew.Sdump(*model.Subject))
	log.Printf("Secret name: %s\n", *model.PrivateKeySecretName)
	log.Printf("KMS id: %s\n", *model.PrivateKeyKmsKeyId)

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
	log.Printf("Key size: %s\n", keySize)

	expiration := time.Now().AddDate(0, 0, expirationDays)
	log.Printf("Cert expiration: %s\n", expiration)

	pkixName := model.Subject.ToPkixName()
	log.Printf("PKIX Name: %s\n", pkixName)

	max := new(big.Int)
	max.Exp(big.NewInt(2), big.NewInt(20), nil).Sub(max, big.NewInt(1))
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to generate serial.")
	}
	log.Printf("Serial: " + n.Text(10))

	ca := &x509.Certificate{
		SerialNumber:          n,
		Subject:               pkixName,
		NotBefore:             time.Now(),
		NotAfter:              expiration,
		IsCA:                  true,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		BasicConstraintsValid: true,
	}

	log.Printf("Created cert: %s\n", ca)

	caPrivKey, err := rsa.GenerateKey(rand.Reader, keySize)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to generate private key.")
	}

	log.Printf("Created key.")

	caBytes, err := x509.CreateCertificate(rand.Reader, ca, ca, &caPrivKey.PublicKey, caPrivKey)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to sign certificate.")
	}

	certPem, err := certBytesToPem(caBytes)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to serialize certificate bytes to PEM.")
	}

	keyPem, err := privKeyToPem(caPrivKey)
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to serialize certificate private key to PEM.")
	}

	serialStr := n.Text(10)
	secretJsonStruct := CertMaterialJson{
		PublicKeyPem:   *certPem,
		PrivateKeyPem:  *keyPem,
		Subject:        *model.Subject,
		KeySize:        keySize,
		ExpirationDays: expirationDays,
		Serial:         serialStr,
		KmsKeyId:       *model.PrivateKeyKmsKeyId,
	}
	secretJsonStr := secretJsonStruct.json()

	c, err := req.Session.Config.Credentials.Get()
	if err != nil {
		panic("Could not get creds.")
	} else {
		log.Printf("Creds: %s, %s, %s", c.AccessKeyID, c.SecretAccessKey, c.SessionToken)
	}
	smClient := secretsmanager.New(req.Session)
	smTags := []*secretsmanager.Tag{}

	if model.Tags != nil {
		for _, t := range model.Tags {
			smTags = append(smTags, &secretsmanager.Tag{
				Key:   t.Key,
				Value: t.Value,
			})
		}
	}
	res, err := smClient.CreateSecret(&secretsmanager.CreateSecretInput{
		Name:         model.PrivateKeySecretName,
		KmsKeyId:     model.PrivateKeyKmsKeyId,
		SecretString: &secretJsonStr,
		Tags:         smTags,
	})
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to create CA cert secret.")
	}

	model.PrivateKeySecretArn = res.ARN
	model.PublicCertificatePem = certPem
	ss := (ca.SerialNumber).Text(10)
	model.Serial = &ss

	log.Printf("Completed create request: \n%s\n", spew.Sdump(*model))

	return handler.ProgressEvent{
		OperationStatus: handler.Success,
		Message:         "Created CA Certificate.",
		ResourceModel:   model,
	}, nil
}

// Read handles the Read event from the Cloudformation service.
func Read(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {

	log.Printf("Received read request!")
	log.Printf("Current Model: \n%s\n", spew.Sdump(*currentModel))

	secretId := *currentModel.PrivateKeySecretArn
	log.Printf("Loading RootCA info for secret: %s", secretId)
	smClient := secretsmanager.New(req.Session)
	res, err := smClient.GetSecretValue(&secretsmanager.GetSecretValueInput{
		SecretId: &secretId,
	})
	if err != nil {
		return handler.ProgressEvent{}, errors.Wrap(err, "Unable to fetch CA secret.")
	}
	material, err := NewMaterialFromJson(*res.SecretString)
	currentModel.Serial = &material.Serial
	currentModel.Subject = &material.Subject
	currentModel.KeySize = &material.KeySize
	currentModel.ExpirationDays = &material.ExpirationDays
	currentModel.PrivateKeyKmsKeyId = &material.KmsKeyId
	return handler.ProgressEvent{
		OperationStatus: handler.Success,
		ResourceModel:   currentModel,
	}, nil
}

// Update handles the Update event from the Cloudformation service.
func Update(req handler.Request, prevModel *Model, newModel *Model) (handler.ProgressEvent, error) {

	log.Printf("Received update request!")
	log.Printf("Prev model: \n%s\n", spew.Sdump(*prevModel))
	log.Printf("New model: \n%s\n", spew.Sdump(*newModel))
	return handler.ProgressEvent{}, errors.New("Not implemented: Update")

}

// Delete handles the Delete event from the Cloudformation service.
func Delete(req handler.Request, prevModel *Model, currentModel *Model) (handler.ProgressEvent, error) {

	log.Printf("Received delete request!")

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

	log.Printf("Received list request!")

	return handler.ProgressEvent{
		OperationStatus: handler.Success,
		Message:         "List Complete",
		ResourceModel:   currentModel,
	}, nil
}
