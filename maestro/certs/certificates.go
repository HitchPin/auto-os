package certs

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"github.com/HitchPin/maestro/certs/models"
	"math/big"
	"time"
)

type CertSigner func(certificate x509.Certificate, pubKey rsa.PublicKey) ([]byte, error)

func NewCaCert(req models.NewCARequest) (*models.CertResult, error) {
	ca := &x509.Certificate{
		SerialNumber:          big.NewInt(2019),
		Subject:               req.Subject.ToPkixName(),
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(10, 0, 0),
		IsCA:                  true,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		BasicConstraintsValid: true,
	}

	caPrivKey, err := rsa.GenerateKey(rand.Reader, req.Key.KeySize)
	if err != nil {
		return nil, err
	}

	caBytes, err := x509.CreateCertificate(rand.Reader, ca, ca, &caPrivKey.PublicKey, caPrivKey)
	if err != nil {
		return nil, err
	}

	certPem, err := CertBytesToPem(caBytes)
	if err != nil {
		return nil, err
	}

	keyPem, err := privKeyToPem(caPrivKey)
	if err != nil {
		return nil, err
	}

	return &models.CertResult{
		CertPem: *certPem,
		KeyPem:  *keyPem,
		Cert:    *ca,
	}, nil
}

func NewCert(req models.NewCertificateRequest, signer CertSigner) (*models.CertResult, error) {

	var usage x509.KeyUsage = 0
	extKeyUsage := []x509.ExtKeyUsage{}
	if req.IsForServer {
		extKeyUsage = append(extKeyUsage, x509.ExtKeyUsageServerAuth)
		usage = usage | x509.KeyUsageDigitalSignature |
			x509.KeyUsageKeyEncipherment |
			x509.KeyUsageDataEncipherment |
			x509.KeyUsageCRLSign |
			x509.KeyUsageCertSign
	}
	if req.IsForClient {
		usage = usage | x509.KeyUsageDigitalSignature | 64
		extKeyUsage = append(extKeyUsage, x509.ExtKeyUsageClientAuth)
	}

	cert := &x509.Certificate{
		SerialNumber: big.NewInt(1658),
		Subject:      req.Subject.ToPkixName(),
		NotBefore:    time.Now(),
		NotAfter:     time.Now().AddDate(2, 0, 0),
		ExtKeyUsage:  extKeyUsage,
		KeyUsage:     usage,
	}

	if req.Subject.CommonName != nil {
		cert.DNSNames = []string{
			*req.Subject.CommonName,
		}
	}

	if req.SubjectAlternateNames != nil {
		if len(req.SubjectAlternateNames.DNSNames) > 0 {
			for _, dn := range req.SubjectAlternateNames.DNSNames {
				cert.DNSNames = append(cert.DNSNames, dn)
			}
		}
	}

	certPrivKey, err := rsa.GenerateKey(rand.Reader, req.Key.KeySize)
	if err != nil {
		return nil, err
	}

	certBytes, err := signer(*cert, certPrivKey.PublicKey)
	if err != nil {
		return nil, err
	}

	certPem, err := CertBytesToPem(certBytes)
	if err != nil {
		return nil, err
	}

	keyPem, err := privKeyToPem(certPrivKey)
	if err != nil {
		return nil, err
	}

	return &models.CertResult{
		CertPem: *certPem,
		KeyPem:  *keyPem,
		Cert:    *cert,
	}, nil
}

type StoredCertificateAuthority struct {
	CertificatePem string
	PrivateKeyPem  string
}
