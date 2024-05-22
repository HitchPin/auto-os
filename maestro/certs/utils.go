package certs

import (
	"bytes"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
)

func LoadCertFromBytes(data []byte) (*x509.Certificate, error) {
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

func CertBytesToPem(certBytes []byte) (*string, error) {
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
