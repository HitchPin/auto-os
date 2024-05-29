package resource

import (
	"bytes"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
)

func (subject Subject) ToPkixName() pkix.Name {
	pn := pkix.Name{}

	if subject.CommonName != nil {
		pn.CommonName = *subject.CommonName
	}
	if subject.Organization != nil {
		pn.Organization = []string{*subject.Organization}
	}
	if subject.OrganizationalUnit != nil {
		pn.OrganizationalUnit = []string{*subject.OrganizationalUnit}
	}
	if subject.Country != nil {
		pn.Country = []string{*subject.Country}
	}
	if subject.State != nil {
		pn.Province = []string{*subject.State}
	}
	if subject.City != nil {
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
