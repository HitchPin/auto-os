package resource

import (
	"bytes"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/json"
	"encoding/pem"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
	"github.com/pkg/errors"
	"log"
)

type Subject struct {
	CommonName         *string
	Organization       *string
	OrganizationalUnit *string
	Country            *string
	State              *string
	City               *string
	Uid                *string
}

func (subject Subject) ToPkixName() pkix.Name {
	pn := pkix.Name{}

	if subject.CommonName != nil {
		log.Printf("Including common name = %s\n", *subject.CommonName)
		pn.CommonName = *subject.CommonName
	}
	if subject.Organization != nil {
		log.Printf("Including org = %s\n", *subject.Organization)
		pn.Organization = []string{*subject.Organization}
	}
	if subject.OrganizationalUnit != nil {
		log.Printf("Including OU = %s\n", *subject.OrganizationalUnit)
		pn.OrganizationalUnit = []string{*subject.OrganizationalUnit}
	}
	if subject.Country != nil {
		log.Printf("Including Country = %s\n", *subject.Country)
		pn.Country = []string{*subject.Country}
	}
	if subject.State != nil {
		log.Printf("Including State = %s\n", *subject.State)
		pn.Province = []string{*subject.State}
	}
	if subject.City != nil {
		log.Printf("Including City = %s\n", *subject.City)
		pn.Locality = []string{*subject.City}
	}

	return pn
}

type CertSigner func(certificate x509.Certificate, pubKey rsa.PublicKey) ([]byte, error)

func GetRootCAMaterial(smClient secretsmanager.SecretsManager, secretId string) (*CertMaterialJson, error) {
	res, err := smClient.GetSecretValue(&secretsmanager.GetSecretValueInput{
		SecretId: &secretId,
	})
	if err != nil {
		return nil, errors.Wrap(err, "Unable to fetch CA secret.")
	}
	material, err := NewMaterialFromJson(*res.SecretString)
	return material, err
}

func NewCertSigner(material CertMaterialJson) (*CertSigner, *x509.Certificate, error) {

	key, err := loadKeyFromBytes([]byte(material.PrivateKeyPem))
	if err != nil {
		return nil, nil, err
	}
	cert, err := loadCertFromBytes([]byte(material.PublicKeyPem))
	if err != nil {
		return nil, nil, err
	}

	var cs CertSigner
	cs = func(certificate x509.Certificate, pubKey rsa.PublicKey) ([]byte, error) {
		certBytes, err := x509.CreateCertificate(rand.Reader, &certificate, cert, &pubKey, key)
		if err != nil {
			return nil, err
		}
		return certBytes, nil
	}
	return &cs, cert, nil
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
	log.Printf("Computed cert PEM:\n%s\n\n", str)
	return &str, nil
}

func privKeyToPem(certPrivKey *rsa.PrivateKey) (*string, error) {

	marshalled, err := x509.MarshalPKCS8PrivateKey(certPrivKey)
	if err != nil {
		return nil, err
	}
	certPrivKeyPEM := new(bytes.Buffer)
	err = pem.Encode(certPrivKeyPEM, &pem.Block{
		Type:  "PRIVATE KEY",
		Bytes: marshalled,
	})
	if err != nil {
		return nil, err
	}

	s := certPrivKeyPEM.String()
	return &s, nil
}

type CertMaterialJson struct {
	PublicKeyPem   string
	PrivateKeyPem  string
	Subject        Subject
	KeySize        int
	ExpirationDays int
	Serial         string
	KmsKeyId       string
}

func (m CertMaterialJson) json() string {
	jsonBytes, err := json.Marshal(m)
	if err != nil {
		panic(err)
	}
	return string(jsonBytes)
}
func NewMaterialFromJson(j string) (*CertMaterialJson, error) {
	m := new(CertMaterialJson)
	err := json.Unmarshal([]byte(j), m)
	if err != nil {
	}
	return m, err
}

func loadKeyFromBytes(data []byte) (*rsa.PrivateKey, error) {
	for block, rest := pem.Decode(data); block != nil; block, rest = pem.Decode(rest) {
		switch block.Type {
		case "CERTIFICATE":
			return nil, errors.New("encountered certificate, was expecting RSA PRIVATE KEY")

		case "PRIVATE KEY":
			key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
			if err != nil {
				return nil, err
			}
			rsaKey := key.(*rsa.PrivateKey)
			return rsaKey, nil

		case "RSA PRIVATE KEY":
			key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
			if err != nil {
				return nil, err
			}
			return key, nil

		default:
			panic("unknown block type")
		}
	}
	return nil, errors.New("how did we get here")
}

func loadCertFromBytes(data []byte) (*x509.Certificate, error) {
	for block, rest := pem.Decode(data); block != nil; block, rest = pem.Decode(rest) {
		switch block.Type {
		case "CERTIFICATE":
			cert, err := x509.ParseCertificate(block.Bytes)
			if err != nil {
				return nil, err
			}
			return cert, nil

		case "PRIVATE KEY":
			return nil, errors.New("encountered private, was expecting CERTIFICATE")

		default:
			return nil, errors.New("unknown PEM block type")
		}
	}
	return nil, errors.New("how did we get here")
}
