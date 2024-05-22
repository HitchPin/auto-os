package shapes

import (
	"encoding/json"
	"fmt"
	"strings"
)

type CombinationTechnique uint8

const (
	ArithmeticMean CombinationTechnique = iota + 1
	GeometricMean
	HarmonicMean
)

var (
	combinationTechnique_name = map[uint8]string{
		1: "arithmetic_mean",
		2: "geometric_mean",
		3: "harmonic_mean",
	}
	combinationTechnique_value = map[string]uint8{
		"arithmetic_mean": 1,
		"geometric_mean":  2,
		"harmonic_mean":   3,
	}
)

func (s CombinationTechnique) String() string {
	return combinationTechnique_name[uint8(s)]
}
func ParseCombinationTechnique(s string) (CombinationTechnique, error) {
	s = strings.TrimSpace(strings.ToLower(s))
	value, ok := combinationTechnique_value[s]
	if !ok {
		return CombinationTechnique(0), fmt.Errorf("%q is not a valid combination technique", s)
	}
	return CombinationTechnique(value), nil
}
func (s CombinationTechnique) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}
func (s *CombinationTechnique) UnmarshalJSON(data []byte) (err error) {
	var combinationTechniques string
	if err := json.Unmarshal(data, &combinationTechniques); err != nil {
		return err
	}
	if *s, err = ParseCombinationTechnique(combinationTechniques); err != nil {
		return err
	}
	return nil
}
