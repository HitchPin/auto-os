package resource

import (
	"bytes"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/json"
	"encoding/pem"
	"log"
)

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
