package shapes

import (
	"encoding/json"
	"fmt"
	"strings"
)

type TaskType uint8

const (
	TRAINING TaskType = iota + 1
	PREDICTION
	TRAINING_AND_PREDICTION
	EXECUTION
	UPLOAD_MODEL
	LOAD_MODEL
	REGISTER_MODEL
	DEPLOY_MODEL
)

var (
	taskType_name = map[uint8]string{
		1: "TRAINING",
		2: "PREDICTION",
		3: "TRAINING_AND_PREDICTION",
		4: "EXECUTION",
		5: "UPLOAD_MODEL",
		6: "LOAD_MODEL",
		7: "REGISTER_MODEL",
		8: "DEPLOY_MODEL",
	}
	taskType_value = map[string]uint8{
		"TRAINING":                1,
		"PREDICTION":              2,
		"TRAINING_AND_PREDICTION": 3,
		"EXECUTION":               4,
		"UPLOAD_MODEL":            5,
		"LOAD_MODEL":              6,
		"REGISTER_MODEL":          7,
		"DEPLOY_MODEL":            8,
	}
)

func (s TaskType) String() string {
	return taskType_name[uint8(s)]
}
func ParseTaskType(s string) (TaskType, error) {
	s = strings.TrimSpace(strings.ToUpper(s))
	value, ok := taskType_value[s]
	if !ok {
		return TaskType(0), fmt.Errorf("%q is not a valid task type", s)
	}
	return TaskType(value), nil
}
func (s TaskType) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}
func (s *TaskType) UnmarshalJSON(data []byte) (err error) {
	var taskTypes string
	if err := json.Unmarshal(data, &taskTypes); err != nil {
		return err
	}
	if *s, err = ParseTaskType(taskTypes); err != nil {
		return err
	}
	return nil
}
