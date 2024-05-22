package shapes

import (
	"encoding/json"
	"fmt"
	"strings"
)

type InputDataType uint8

const (
	SEARCH_QUERY InputDataType = iota + 1
	DATA_FRAME
	TEXT_DOCS
	REMOTE
	TEXT_SIMILARITY
	QUESTION_ANSWERING
)

var (
	inputDataType_name = map[uint8]string{
		1: "SEARCH_QUERY",
		2: "DATA_FRAME",
		3: "TEXT_DOCS",
		4: "REMOTE",
		5: "TEXT_SIMILARITY",
		6: "QUESTION_ANSWERING",
	}
	inputDataType_value = map[string]uint8{
		"SEARCH_QUERY":       1,
		"DATA_FRAME":         2,
		"TEXT_DOCS":          3,
		"REMOTE":             4,
		"TEXT_SIMILARITY":    5,
		"QUESTION_ANSWERING": 6,
	}
)

func (s InputDataType) String() string {
	return inputDataType_name[uint8(s)]
}
func ParseInputDataType(s string) (InputDataType, error) {
	s = strings.TrimSpace(strings.ToUpper(s))
	value, ok := inputDataType_value[s]
	if !ok {
		return InputDataType(0), fmt.Errorf("%q is not a valid input data type", s)
	}
	return InputDataType(value), nil
}
func (s InputDataType) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}
func (s *InputDataType) UnmarshalJSON(data []byte) (err error) {
	var inputDataTypes string
	if err := json.Unmarshal(data, &inputDataTypes); err != nil {
		return err
	}
	if *s, err = ParseInputDataType(inputDataTypes); err != nil {
		return err
	}
	return nil
}
