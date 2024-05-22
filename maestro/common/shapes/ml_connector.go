package shapes

import (
	"encoding/json"
)

type MLConnectorAction struct {
	ActionType          string            `json:"action_type"`
	Method              string            `json:"method"`
	Url                 string            `json:"url"`
	Headers             map[string]string `json:"headers,omitempty"`
	RequestBody         string            `json:"request_body,omitempty"`
	PreProcessFunction  string            `json:"pre_process_function,omitempty"`
	PostProcessFunction string            `json:"post_process_function,omitempty"`
}

type MLConnector struct {
	ConnectorId string              `json:"-"`
	Name        *string             `json:"name"`
	Description *string             `json:"description,omitempty"`
	Version     *string             `json:"version"`
	Protocol    *string             `json:"protocol"`
	Credential  map[string]string   `json:"credential"`
	Parameters  map[string]string   `json:"parameters"`
	Actions     []MLConnectorAction `json:"actions"`
}

func ConnectorFromMap(m map[string]interface{}) (*MLConnector, error) {
	mapJson, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}

	connector := new(MLConnector)
	err = ParseMLConnector(string(mapJson), connector)
	if err != nil {
		return nil, err
	}
	return connector, nil
}

func ParseMLConnector(jsonStr string, connector *MLConnector) error {

	jsonBytes := []byte(jsonStr)
	if err := json.Unmarshal(jsonBytes, &connector); err != nil {
		return err
	}
	return nil
}

func (connector MLConnector) ToJson() (string, error) {
	jsonBytes, err := json.Marshal(connector)

	if err != nil {
		return "", err
	}
	jsonStr := string(jsonBytes)
	return jsonStr, nil
}
