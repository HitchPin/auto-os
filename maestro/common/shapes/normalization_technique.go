package shapes

import (
	"encoding/json"
	"fmt"
	"strings"
)

type NormalizationTechnique uint8

const (
	MIN_MAX NormalizationTechnique = iota + 1
	L2
)

var (
	normalizationTechnique_name = map[uint8]string{
		1: "min_max",
		2: "l2",
	}
	normalizationTechnique_value = map[string]uint8{
		"min_max": 1,
		"l2":      2,
	}
)

func (s NormalizationTechnique) String() string {
	return normalizationTechnique_name[uint8(s)]
}
func ParseNormalizationTechnique(s string) (NormalizationTechnique, error) {
	s = strings.TrimSpace(strings.ToLower(s))
	value, ok := normalizationTechnique_value[s]
	if !ok {
		return NormalizationTechnique(0), fmt.Errorf("%q is not a valid normalization technique", s)
	}
	return NormalizationTechnique(value), nil
}
func (s NormalizationTechnique) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}
func (s *NormalizationTechnique) UnmarshalJSON(data []byte) (err error) {
	var normalizationTechniques string
	if err := json.Unmarshal(data, &normalizationTechniques); err != nil {
		return err
	}
	if *s, err = ParseNormalizationTechnique(normalizationTechniques); err != nil {
		return err
	}
	return nil
}
