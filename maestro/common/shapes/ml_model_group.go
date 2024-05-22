package shapes

import (
	"encoding/json"
	"time"
)

type MLModelGroupOwner struct {
	BackendRoles         []string `json:"backend_roles"`
	Roles                []string `json:"roles"`
	Name                 string   `json:"name"`
	CustomAttributeNames []string `json:"custom_attribute_names"`
	UserRequestedTenant  string   `json:"user_requested_tenant"`
}

type MLModelGroup struct {
	Name            string             `json:"name"`
	ModelGroupId    string             `json:"model_group_id"`
	Description     string             `json:"description"`
	Version         int                `json:"latest_version"`
	BackendRoles    []string           `json:"backend_roles"`
	Owner           *MLModelGroupOwner `json:"owner"`
	Access          ModelGroupAccess   `json:"access"`
	CreatedTime     time.Time          `json:"created_time"`
	LastUpdatedTime time.Time          `json:"last_updated_time"`
}

func ModelGroupFromMap(m map[string]interface{}) (*MLModelGroup, error) {
	mapJson, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}

	modelGroup := new(MLModelGroup)
	err = ParseMLModelGroup(string(mapJson), modelGroup)
	if err != nil {
		return nil, err
	}
	return modelGroup, nil
}
func ParseMLModelGroup(jsonStr string, mlModelGroup *MLModelGroup) error {
	type Alias MLModelGroup
	aux := &struct {
		CreatedTime     int64 `json:"created_time"`
		LastUpdatedTime int64 `json:"last_updated_time"`
		*Alias
	}{
		Alias: (*Alias)(mlModelGroup),
	}
	jsonBytes := []byte(jsonStr)
	if err := json.Unmarshal(jsonBytes, &aux); err != nil {
		return err
	}
	mlModelGroup.CreatedTime = time.UnixMilli(aux.CreatedTime)
	mlModelGroup.LastUpdatedTime = time.UnixMilli(aux.LastUpdatedTime)
	return nil
}

func (mlModelGroup MLModelGroup) ToJson() (string, error) {
	type Alias MLModelGroup
	jsonBytes, err := json.Marshal(&struct {
		CreatedTime     int64 `json:"created_time"`
		LastUpdatedTime int64 `json:"last_updated_time"`
		*Alias
	}{
		CreatedTime:     mlModelGroup.CreatedTime.UTC().UnixMilli(),
		LastUpdatedTime: mlModelGroup.LastUpdatedTime.UTC().UnixMilli(),
		Alias:           (*Alias)(&mlModelGroup),
	})

	if err != nil {
		return "", err
	}
	jsonStr := string(jsonBytes)
	return jsonStr, nil
}
