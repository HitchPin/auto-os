package shapes

import (
	"encoding/json"
	"fmt"
	"strings"
)

type ModelGroupAccess uint8

const (
	PUBLIC ModelGroupAccess = iota + 1
	PRIVATE
	RESTRICTED
)

var (
	modelGroupAccess_name = map[uint8]string{
		1: "PUBLIC",
		2: "PRIVATE",
		3: "RESTRICTED",
	}
	modelGroupAccess_value = map[string]uint8{
		"PUBLIC":     1,
		"PRIVATE":    2,
		"RESTRICTED": 3,
	}
)

func (s ModelGroupAccess) String() string {
	return modelGroupAccess_name[uint8(s)]
}
func ParseModelGroupAccess(s string) (ModelGroupAccess, error) {
	s = strings.TrimSpace(strings.ToUpper(s))
	value, ok := modelGroupAccess_value[s]
	if !ok {
		return ModelGroupAccess(0), fmt.Errorf("%q is not a valid model group access type", s)
	}
	return ModelGroupAccess(value), nil
}
func (s ModelGroupAccess) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}
func (s *ModelGroupAccess) UnmarshalJSON(data []byte) (err error) {
	var modelGroupAccessTypes string
	if err := json.Unmarshal(data, &modelGroupAccessTypes); err != nil {
		return err
	}
	if *s, err = ParseModelGroupAccess(modelGroupAccessTypes); err != nil {
		return err
	}
	return nil
}
