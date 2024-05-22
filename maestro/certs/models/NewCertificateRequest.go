package models

type NewCertificateRequest struct {
	IsForServer           bool
	IsForClient           bool
	Subject               Subject
	Key                   KeySettings
	SubjectAlternateNames *AlternativeNames
}
