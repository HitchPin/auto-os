package shapes

import (
	"encoding/json"
	"fmt"
	"strings"
)

type ModelState uint8

const (
	TRAINED ModelState = iota + 1
	UPLOADING
	UPLOADED
	LOADING
	LOADED
	PARTIALLY_LOADED
	UNLOADED
	LOAD_FAILED
	REGISTERING
	REGISTERED
	DEPLOYING
	DEPLOYED
	PARTIALLY_DEPLOYED
	UNDEPLOYED
	DEPLOY_FAILED
)

var (
	modelState_name = map[uint8]string{
		1:  "TRAINED",
		2:  "UPLOADING",
		3:  "UPLOADED",
		4:  "LOADING",
		5:  "LOADED",
		6:  "PARTIALLY_LOADED",
		7:  "UNLOADED",
		8:  "LOAD_FAILED",
		9:  "REGISTERING",
		10: "REGISTERED",
		11: "DEPLOYING",
		12: "DEPLOYED",
		13: "PARTIALLY_DEPLOYED",
		14: "UNDEPLOYED",
		15: "DEPLOY_FAILED",
	}
	modelState_value = map[string]uint8{
		"TRAINED":            1,
		"UPLOADING":          2,
		"UPLOADED":           3,
		"LOADING":            4,
		"LOADED":             5,
		"PARTIALLY_LOADED":   6,
		"UNLOADED":           7,
		"LOAD_FAILED":        8,
		"REGISTERING":        9,
		"REGISTERED":         10,
		"DEPLOYING":          11,
		"DEPLOYED":           12,
		"PARTIALLY_DEPLOYED": 13,
		"UNDEPLOYED":         14,
		"DEPLOY_FAILED":      15,
	}
)

func (s ModelState) String() string {
	return modelState_name[uint8(s)]
}
func ParseModelState(s string) (ModelState, error) {
	s = strings.TrimSpace(strings.ToUpper(s))
	value, ok := modelState_value[s]
	if !ok {
		return ModelState(0), fmt.Errorf("%q is not a valid model state", s)
	}
	return ModelState(value), nil
}
func (s ModelState) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}
func (s *ModelState) UnmarshalJSON(data []byte) (err error) {
	var modelStates string
	if err := json.Unmarshal(data, &modelStates); err != nil {
		return err
	}
	if *s, err = ParseModelState(modelStates); err != nil {
		return err
	}
	return nil
}
