package models

import "crypto/x509/pkix"

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
	if subject.Uid != nil {
		pn.ExtraNames = []pkix.AttributeTypeAndValue{
			pkix.AttributeTypeAndValue{
				Type:  []int{0, 9, 2342, 19200300, 100, 1, 1},
				Value: *subject.Uid,
			},
		}
	}

	return pn
}
