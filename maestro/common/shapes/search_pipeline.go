package shapes

import (
	"encoding/json"
)

type SearchPipeline struct {
	Description            *string                `json:"description,omitempty"`
	PhaseResultsProcessors []PhaseResultProcessor `json:"phase_results_processors"`
}

func (s SearchPipeline) MarshalJSON() ([]byte, error) {
	type Alias SearchPipeline
	ps := []map[string]interface{}{}
	for _, p := range s.PhaseResultsProcessors {
		ps = append(ps, p.Bind())
	}
	aliasedPipeline := &struct {
		PhaseResultsProcessors []map[string]interface{} `json:"phase_results_processors"`
		*Alias
	}{
		PhaseResultsProcessors: ps,
		Alias:                  (*Alias)(&s),
	}
	jsonBytes, err := json.Marshal(aliasedPipeline)

	if err != nil {
		return []byte{}, err
	}
	return jsonBytes, nil
}
func (searchPipeline SearchPipeline) ToJson() (string, error) {
	jsonBytes, err := searchPipeline.MarshalJSON()
	if err != nil {
		return "", err
	}
	return string(jsonBytes), nil
}

func ParseSearchPipeline(jsonStr string, searchPipeline *SearchPipeline) error {
	return searchPipeline.UnmarshalJSON([]byte(jsonStr))
}

func (s *SearchPipeline) UnmarshalJSON(data []byte) (err error) {
	pipeMapP := new(map[string]interface{})
	err = json.Unmarshal(data, pipeMapP)
	if err != nil {
		return err
	}
	pipeMap := *pipeMapP
	if descriptionVal, ok := pipeMap["description"]; ok {
		descriptionStr := descriptionVal.(string)
		s.Description = &descriptionStr
	}
	processorIfaces := pipeMap["phase_results_processors"].([]interface{})
	processors := []PhaseResultProcessor{}
	for _, pi := range processorIfaces {
		piMap := pi.(map[string]interface{})
		if normalP, ok := piMap["normalization-processor"]; ok {
			normalPMap := normalP.(map[string]interface{})
			normalP := new(NormalizationProcessor)
			err := normalP.LoadFromMap(normalPMap)
			if err != nil {
				return err
			}
			processors = append(processors, *normalP)
		}
	}
	s.PhaseResultsProcessors = processors
	return nil
}

type PhaseResultProcessor interface {
	Bind() map[string]interface{}
}
