package shapes

import (
	"encoding/json"
	"time"
)

type MLTask struct {
	TaskId         string        `json:"task_id"`
	ModelId        string        `json:"model_id"`
	TaskType       TaskType      `json:"task_type"`
	FunctionName   string        `json:"function_name"`
	State          TaskState     `json:"state"`
	InputType      InputDataType `json:"input_type"`
	Progress       float64       `json:"progress"`
	OutputIndex    string        `json:"output_index"`
	WorkerNodes    []string      `json:"worker_node"`
	CreateTime     time.Time     `json:"create_time"`
	LastUpdateTime time.Time     `json:"last_update_time"`
	Error          string        `json:"error"`
	IsAsync        bool          `json:"async"`
}

func ParseMLTask(jsonStr string, mlTask *MLTask) error {
	type Alias MLTask
	aux := &struct {
		CreateTime     int64 `json:"create_time"`
		LastUpdateTime int64 `json:"last_update_time"`
		*Alias
	}{
		Alias: (*Alias)(mlTask),
	}
	jsonBytes := []byte(jsonStr)
	if err := json.Unmarshal(jsonBytes, &aux); err != nil {
		return err
	}
	mlTask.CreateTime = time.UnixMilli(aux.CreateTime)
	mlTask.LastUpdateTime = time.UnixMilli(aux.LastUpdateTime)
	return nil
}

func (mlTask MLTask) ToJson() (string, error) {
	type Alias MLTask
	jsonBytes, err := json.Marshal(&struct {
		CreateTime     int64 `json:"create_time"`
		LastUpdateTime int64 `json:"last_update_time"`
		*Alias
	}{
		CreateTime:     mlTask.CreateTime.UTC().UnixMilli(),
		LastUpdateTime: mlTask.LastUpdateTime.UTC().UnixMilli(),
		Alias:          (*Alias)(&mlTask),
	})

	if err != nil {
		return "", err
	}
	jsonStr := string(jsonBytes)
	return jsonStr, nil
}
