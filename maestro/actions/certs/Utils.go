package certs

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"errors"
	"github.com/HitchPin/maestro/certs"
	"github.com/HitchPin/maestro/certs/models"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

func SaveCertToSecret(smClient secretsmanager.Client, secretId string, cert models.CertResult) (*string, error) {

	stored := certs.StoredCertificateAuthority{
		CertificatePem: cert.CertPem,
		PrivateKeyPem:  cert.KeyPem,
	}
	caJson, err := json.Marshal(stored)
	if err != nil {
		return nil, err
	}
	caJsonStr := string(caJson)
	r, err := smClient.PutSecretValue(context.TODO(), &secretsmanager.PutSecretValueInput{
		SecretId:     &secretId,
		SecretString: &caJsonStr,
	})
	if err != nil {
		return nil, err
	}
	return r.VersionId, err
}

func GetLatestCaCert(smClient secretsmanager.Client, secretId string) (*x509.Certificate, error) {
	return GetCaCert(smClient, secretId, nil)
}
func GetCaCert(smClient secretsmanager.Client, secretId string, versionId *string) (*x509.Certificate, error) {
	stored, err := getStoredCertificateAuthority(smClient, secretId, versionId)
	if err != nil {
		return nil, err
	}
	cert, err := certs.LoadCertFromBytes([]byte(stored.CertificatePem))
	if err != nil {
		return nil, err
	}
	return cert, nil
}

func getStoredCertificateAuthority(smClient secretsmanager.Client, secretId string, versionId *string) (*certs.StoredCertificateAuthority, error) {

	req := secretsmanager.GetSecretValueInput{
		SecretId: &secretId,
	}
	if versionId != nil {
		req.VersionId = versionId
	}
	sv, err := smClient.GetSecretValue(context.TODO(), &req)
	if err != nil {
		return nil, err
	}
	creds := new(certs.StoredCertificateAuthority)
	err = json.Unmarshal([]byte(*sv.SecretString), &creds)
	if err != nil {
		return nil, err
	}
	return creds, nil
}

func NewCertSigner(smClient secretsmanager.Client, secretId string) (*certs.CertSigner, *x509.Certificate, error) {

	creds, err := getStoredCertificateAuthority(smClient, secretId, nil)
	if err != nil {
		return nil, nil, err
	}

	key, err := loadKeyFromBytes([]byte(creds.PrivateKeyPem))
	if err != nil {
		return nil, nil, err
	}
	cert, err := certs.LoadCertFromBytes([]byte(creds.CertificatePem))
	if err != nil {
		return nil, nil, err
	}

	var cs certs.CertSigner
	cs = func(certificate x509.Certificate, pubKey rsa.PublicKey) ([]byte, error) {
		certBytes, err := x509.CreateCertificate(rand.Reader, &certificate, cert, &pubKey, key)
		if err != nil {
			return nil, err
		}
		return certBytes, nil
	}
	return &cs, cert, nil
}

func loadKeyFromBytes(data []byte) (*rsa.PrivateKey, error) {
	for block, rest := pem.Decode(data); block != nil; block, rest = pem.Decode(rest) {
		switch block.Type {
		case "CERTIFICATE":
			return nil, errors.New("encountered certificate, was expecting RSA PRIVATE KEY")

		case "PRIVATE KEY":
			key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
			if err != nil {
				return nil, err
			}

			return key, nil

		case "RSA PRIVATE KEY":
			key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
			if err != nil {
				return nil, err
			}
			rsaKey := key.(rsa.PrivateKey)
			return &rsaKey, nil

		default:
			panic("unknown block type")
		}
	}
	return nil, errors.New("how did we get here")
}

func certBytesToPem(certBytes []byte) (*string, error) {
	certPEM := new(bytes.Buffer)
	err := pem.Encode(certPEM, &pem.Block{
		Type:  "CERTIFICATE",
		Bytes: certBytes,
	})
	if err != nil {
		return nil, err
	}
	str := certPEM.String()
	return &str, nil
}
