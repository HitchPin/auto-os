package shapes

import (
	"encoding/json"
	"fmt"
	"strings"
)

type TaskState uint8

const (
	CREATED TaskState = iota + 1
	RUNNING
	COMPLETED
	FAILED
	CANCELLED
	COMPLETED_WITH_ERROR
)

var (
	taskState_name = map[uint8]string{
		1: "CREATED",
		2: "RUNNING",
		3: "COMPLETED",
		4: "FAILED",
		5: "CANCELLED",
		6: "COMPLETED_WITH_ERROR",
	}
	taskState_value = map[string]uint8{
		"CREATED":              1,
		"RUNNING":              2,
		"COMPLETED":            3,
		"FAILED":               4,
		"CANCELLED":            5,
		"COMPLETED_WITH_ERROR": 6,
	}
)

func (s TaskState) String() string {
	return taskState_name[uint8(s)]
}
func ParseTaskState(s string) (TaskState, error) {
	s = strings.TrimSpace(strings.ToUpper(s))
	value, ok := taskState_value[s]
	if !ok {
		return TaskState(0), fmt.Errorf("%q is not a valid task state", s)
	}
	return TaskState(value), nil
}
func (s TaskState) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.String())
}
func (s *TaskState) UnmarshalJSON(data []byte) (err error) {
	var taskStates string
	if err := json.Unmarshal(data, &taskStates); err != nil {
		return err
	}
	if *s, err = ParseTaskState(taskStates); err != nil {
		return err
	}
	return nil
}
