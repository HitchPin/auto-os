package clients

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/HitchPin/maestro/common/shapes"
	elastic7 "github.com/olivere/elastic/v7"
)

type ModelGroupsClient struct {
	osClient *elastic7.Client
}

type RegisterModelGroupsRequest struct {
	Name               string                   `json:"name"`
	Description        *string                  `json:"description,omitempty"`
	Access             *shapes.ModelGroupAccess `json:"access,omitempty"`
	BackendRoles       []string                 `json:"backend_roles,omitempty"`
	AddAllBackendRoles *bool                    `json:"add_all_backend_roles,omitempty"`
}
type RegisterModelGroupsResponse struct {
	ModelGroupId string `json:"model_group_id"`
	Status       string `json:"status"`
}

func newModelGroupsClient(osClient *elastic7.Client) ModelGroupsClient {
	return ModelGroupsClient{
		osClient: osClient,
	}
}

func (client ModelGroupsClient) RegisterModelGroup(req RegisterModelGroupsRequest) (*RegisterModelGroupsResponse, error) {

	var (
		err       error
		res       *elastic7.Response
		jsonBytes []byte
	)
	response := new(RegisterModelGroupsResponse)

	jsonBytes, err = json.Marshal(req)
	res, err = client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method:           "POST",
		Path:             "/_plugins/_ml/model_groups/_register",
		Body:             string(jsonBytes),
		RetryStatusCodes: []int{http.StatusConflict, http.StatusInternalServerError},
		Retrier: elastic7.NewBackoffRetrier(
			elastic7.NewExponentialBackoff(100*time.Millisecond, 30*time.Second),
		),
	})
	if err != nil {
		return nil, err
	}

	responseBody := res.Body
	if err := json.Unmarshal(responseBody, response); err != nil {
		return nil, fmt.Errorf("error unmarshalling response body: %+v: %+v", err, responseBody)
	}

	return response, nil
}

func (client ModelGroupsClient) DeleteModelGroup(modelGroupId string) error {

	response, err := client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "DELETE",
		Path:   "/_plugins/_ml/model_groups/" + modelGroupId,
	})
	if err != nil {
		return err
	}

	m := map[string]interface{}{}
	err = json.Unmarshal([]byte(response.Body), &m)
	if err != nil {
		return err
	}

	result := m["result"].(string)
	if result != "deleted" {
		return errors.New("Result of delete operation was " + result)
	}
	return nil
}

func (client ModelGroupsClient) ListGroups() ([]shapes.MLModelGroup, error) {
	var modelGroups []shapes.MLModelGroup
	query := map[string]interface{}{
		"query": map[string]interface{}{
			"match_all": map[string]interface{}{},
		},
	}
	modelGroups, err := client.searchModelGroups(query)
	if err != nil {
		return modelGroups, err
	}
	return modelGroups, nil
}

func (client ModelGroupsClient) GetModelGroupById(modelGroupId string) (*shapes.MLModelGroup, error) {
	return client.GetModelGroupByProperty("_id", modelGroupId)
}

func (client ModelGroupsClient) GetModelGroupByName(modelGroupName string) (*shapes.MLModelGroup, error) {
	return client.GetModelGroupByProperty("name", modelGroupName)
}

func (client ModelGroupsClient) GetModelGroupByProperty(propName string, propVal string) (*shapes.MLModelGroup, error) {
	query := map[string]interface{}{
		"query": map[string]interface{}{
			"match": map[string]interface{}{
				propName: propVal,
			},
		},
	}
	modelGroups, err := client.searchModelGroups(query)
	if err != nil {
		return nil, err
	}
	if len(modelGroups) == 0 {
		errors.New("Model group not found.")
	}
	return &modelGroups[0], nil
}

func (client ModelGroupsClient) searchModelGroups(query map[string]interface{}) ([]shapes.MLModelGroup, error) {
	queryJSON, err := json.Marshal(query)
	var res *elastic7.Response
	res, err = client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method:           "POST",
		Path:             "/_plugins/_ml/model_groups/_search",
		Body:             string(queryJSON),
		RetryStatusCodes: []int{http.StatusConflict, http.StatusInternalServerError},
		Retrier: elastic7.NewBackoffRetrier(
			elastic7.NewExponentialBackoff(100*time.Millisecond, 30*time.Second),
		),
	})
	if err != nil {
		return nil, err
	}

	responseBody := res.Body

	response := new(shapes.SearchResponse)
	err = json.Unmarshal([]byte(responseBody), &response)
	if err != nil {
		return nil, err
	}
	hits := response.Hits.Hits

	var modelGroups []shapes.MLModelGroup
	for _, h := range hits {
		mg, err := shapes.ModelGroupFromMap(h.Source)
		if err != nil {
			return nil, err
		}
		mg.ModelGroupId = h.Id
		modelGroups = append(modelGroups, *mg)
	}

	return modelGroups, nil
}
