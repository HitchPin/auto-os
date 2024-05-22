package shapes

import (
	"encoding/json"
	"fmt"
	"strings"
)

type ModelFormat uint8

const (
	ONNX ModelFormat = iota + 1
	TORCH_SCRIPT
)

var (
	modelFormat_name = map[uint8]string{
		1: "ONNX",
		2: "TORCH_SCRIPT",
	}
	modelFormat_value = map[string]uint8{
		"ONNX":         1,
		"TORCH_SCRIPT": 2,
	}
)

func (s ModelFormat) String() string {
	return modelFormat_name[uint8(s)]
}
func ParseModelFormat(s string) (ModelFormat, error) {
	s = strings.TrimSpace(strings.ToUpper(s))
	value, ok := modelFormat_value[s]
	if !ok {
		return ModelFormat(0), fmt.Errorf("%q is not a valid model format", s)
	}
	return ModelFormat(value), nil
}
func (s ModelFormat) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}
func (s *ModelFormat) UnmarshalJSON(data []byte) (err error) {
	var modelFormats string
	if err := json.Unmarshal(data, &modelFormats); err != nil {
		return err
	}
	if *s, err = ParseModelFormat(modelFormats); err != nil {
		return err
	}
	return nil
}
