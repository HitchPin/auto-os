package certs

import (
	"fmt"
	"os"
)

func SaveCertToFile(cert StoredCertificate, certFile string, keyFile string) error {

	err := writeStringToFile(cert.CertificatePem, certFile)
	if err != nil {
		return err
	}

	err = writeStringToFile(cert.PrivateKeyPem, keyFile)
	if err != nil {
		return err
	}

	return nil
}

type StoredCertificate struct {
	CertificatePem string
	PrivateKeyPem  string
}

func writeStringToFile(str string, filePath string) error {
	f, err := os.Create(filePath)
	if err != nil {
		fmt.Println(err)
		return err
	}
	_, err = f.WriteString(str)
	if err != nil {
		fmt.Println(err)
		f.Close()
		return err
	}
	err = f.Close()
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}
