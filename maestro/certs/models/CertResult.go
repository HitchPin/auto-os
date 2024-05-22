package models

import "crypto/x509"

type CertResult struct {
	CertPem string
	KeyPem  string
	Cert    x509.Certificate
}
