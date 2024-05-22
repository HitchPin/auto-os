package shapes

import (
	"encoding/json"
)

type Normalization struct {
	Technique NormalizationTechnique `json:"technique"`
}
type CombinationParameters struct {
	Weights []float32 `json:"weights"`
}
type Combination struct {
	Technique  CombinationTechnique  `json:"technique"`
	Parameters CombinationParameters `json:"parameters"`
}
type NormalizationProcessor struct {
	Normalization Normalization `json:"normalization"`
	Combination   Combination   `json:"combination"`
}

func (v NormalizationProcessor) Bind() map[string]interface{} {
	jsonBytes, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}

	m := new(map[string]interface{})
	err = json.Unmarshal(jsonBytes, &m)
	if err != nil {
		panic(err)
	}

	wrapped := map[string]interface{}{
		"normalization-processor": *m,
	}

	return wrapped
}

func (v *NormalizationProcessor) LoadFromMap(m map[string]interface{}) error {

	jsonBytes, err := json.Marshal(m)
	if err != nil {
		return err
	}

	err = json.Unmarshal(jsonBytes, &v)
	if err != nil {
		panic(err)
	}

	return nil
}
