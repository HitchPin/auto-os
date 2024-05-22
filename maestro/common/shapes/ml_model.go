package shapes

import (
	"encoding/json"
	"time"
)

type MLModelDeploySetting struct {
	IsAutoDeployEnabled bool `json:"is_auto_deploy_enabled"`
}

type MLModelConfig struct {
	ModelType string `json:"model_type"`
	AllConfig string `json:"all_config"`
}

type MLModel struct {
	Name                    string                `json:"name"`
	ModelId                 string                `json:"model_id"`
	ModelGroupId            string                `json:"model_group_id"`
	Algorithm               string                `json:"algorithm"`
	Version                 string                `json:"version"`
	Content                 string                `json:"content"`
	Description             string                `json:"description"`
	ModelFormat             ModelFormat           `json:"model_format"`
	ModelState              ModelState            `json:"model_state"`
	ModelContentSizeInBytes int64                 `json:"model_content_size_in_bytes"`
	ModelContentHash        string                `json:"model_content_hash"`
	ModelConfig             *MLModelConfig        `json:"model_confi"`
	DeploySetting           *MLModelDeploySetting `json:"deploy_setting"`
	IsEnabled               bool                  `json:"is_enabled"`
	IsControllerEnabled     bool                  `json:"is_controller_enabled"`
	CreatedTime             time.Time             `json:"created_time"`
	LastUpdateTime          time.Time             `json:"last_update_time"`
	LastRegisteredTime      time.Time             `json:"last_registered_time"`
	LastDeployedTime        time.Time             `json:"last_deployed_time"`
	LastUndeployedTime      time.Time             `json:"last_undeployed_time"`
	ChunkNumber             int                   `json:"chunk_number"`
	TotalChunks             int                   `json:"total_chunks"`
}

func ModelFromMap(m map[string]interface{}) (*MLModel, error) {
	mapJson, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}

	model := new(MLModel)
	err = ParseMLModel(string(mapJson), model)
	if err != nil {
		return nil, err
	}
	return model, nil
}
func ParseMLModel(jsonStr string, mlModel *MLModel) error {
	type Alias MLModel
	aux := &struct {
		CreatedTime        int64 `json:"created_time,omitempty"`
		LastUpdateTime     int64 `json:"last_update_time,omitempty"`
		LastRegisteredTime int64 `json:"last_registered_time,omitempty"`
		LastDeployedTime   int64 `json:"last_deployed_time,omitempty"`
		LastUndeployedTime int64 `json:"last_undeployed_time,omitempty"`
		*Alias
	}{
		Alias: (*Alias)(mlModel),
	}
	jsonBytes := []byte(jsonStr)
	if err := json.Unmarshal(jsonBytes, &aux); err != nil {
		return err
	}
	mlModel.CreatedTime = time.UnixMilli(aux.CreatedTime)
	mlModel.LastUpdateTime = time.UnixMilli(aux.LastUpdateTime)
	mlModel.LastRegisteredTime = time.UnixMilli(aux.LastRegisteredTime)
	mlModel.LastDeployedTime = time.UnixMilli(aux.LastDeployedTime)
	mlModel.LastUndeployedTime = time.UnixMilli(aux.LastUndeployedTime)
	return nil
}

func (mlModel MLModel) ToJson() (string, error) {
	type Alias MLModel
	jsonBytes, err := json.Marshal(&struct {
		CreatedTime        int64 `json:"created_time,omitempty"`
		LastUpdateTime     int64 `json:"last_update_time,omitempty"`
		LastRegisteredTime int64 `json:"last_registered_time,omitempty"`
		LastDeployedTime   int64 `json:"last_deployed_time,omitempty"`
		LastUndeployedTime int64 `json:"last_undeployed_time,omitempty"`
		*Alias
	}{
		CreatedTime:        mlModel.CreatedTime.UTC().UnixMilli(),
		LastUpdateTime:     mlModel.LastUpdateTime.UTC().UnixMilli(),
		LastRegisteredTime: mlModel.LastRegisteredTime.UTC().UnixMilli(),
		LastDeployedTime:   mlModel.LastDeployedTime.UTC().UnixMilli(),
		LastUndeployedTime: mlModel.LastUndeployedTime.UTC().UnixMilli(),
		Alias:              (*Alias)(&mlModel),
	})

	if err != nil {
		return "", err
	}
	jsonStr := string(jsonBytes)
	return jsonStr, nil
}
