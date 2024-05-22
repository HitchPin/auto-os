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

type ModelsClient struct {
	osClient *elastic7.Client
}

type RegisterModelRequest struct {
	Name         *string             `json:"name"`
	Version      *string             `json:"version,omitempty"`
	FunctionName *string             `json:"function_name,omitempty"`
	ConnectorId  *string             `json:"connector_id,omitempty"`
	ModelFormat  *shapes.ModelFormat `json:"model_format,omitempty"`
	Description  *string             `json:"description,omitempty"`
	ModelGroupId *string             `json:"model_group_id"`
	IsEnabled    *bool               `json:"is_enabled,omitempty"`
}
type RegisterModelResponse struct {
	TaskId string `json:"task_id"`
	Status string `json:"status"`
}
type DeployModelResponse struct {
	TaskId string `json:"task_id"`
	Status string `json:"status"`
}

type ModelsFilter struct {
	ModelGroupId *string
}

func newModelsClient(osClient *elastic7.Client) ModelsClient {
	return ModelsClient{
		osClient: osClient,
	}
}

func (client ModelsClient) RegisterModel(req RegisterModelRequest) (*RegisterModelResponse, error) {

	var (
		err       error
		res       *elastic7.Response
		jsonBytes []byte
	)
	response := new(RegisterModelResponse)

	jsonBytes, err = json.Marshal(req)
	fmt.Printf("Sending model registration request: \n %s \n", string(jsonBytes))
	res, err = client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method:           "POST",
		Path:             "/_plugins/_ml/models/_register",
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

func (client ModelsClient) GetModel(modelId string) (*shapes.MLModel, error) {
	res, err := client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "GET",
		Path:   "/_plugins/_ml/models/" + modelId,
	})
	if err != nil {
		return nil, err
	}

	response := new(shapes.MLModel)
	err = json.Unmarshal([]byte(res.Body), &response)
	if err != nil {
		return nil, err
	}
	return response, nil
}

func (client ModelsClient) DeployModel(modelId string) (*DeployModelResponse, error) {
	res, err := client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "POST",
		Path:   "/_plugins/_ml/models/" + modelId + "/_deploy",
	})
	if err != nil {
		return nil, err
	}

	response := new(DeployModelResponse)
	err = json.Unmarshal([]byte(res.Body), &response)
	if err != nil {
		return nil, err
	}
	return response, nil
}

func (client ModelsClient) DeleteModel(modelId string) error {
	response, err := client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "DELETE",
		Path:   "/_plugins/_ml/models/" + modelId,
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

func (client ModelsClient) UndeployModel(modelId string) error {
	response, err := client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "POST",
		Path:   "/_plugins/_ml/models/" + modelId + "/_undeploy",
	})
	bs := string(response.Body)

	fmt.Println("Undeploy response with status code %s:\n%s\n", response.StatusCode, bs)
	return err
}

func (client ModelsClient) ListModels(filter ModelsFilter) ([]shapes.MLModel, error) {
	var models []shapes.MLModel
	var query map[string]interface{}

	if filter.ModelGroupId != nil {
		mgid := *filter.ModelGroupId
		query = map[string]interface{}{
			"query": map[string]interface{}{
				"term": map[string]interface{}{
					"model_group_id": map[string]interface{}{
						"value": mgid,
					},
				},
			},
		}
	} else {
		query = map[string]interface{}{
			"query": map[string]interface{}{
				"match_all": map[string]interface{}{},
			},
		}
	}
	models, err := client.searchModels(query)
	if err != nil {
		return models, err
	}
	return models, nil
}

func (client ModelsClient) GetModelById(modelId string) (*shapes.MLModel, error) {
	return client.GetModelByProperty("_id", modelId)
}

func (client ModelsClient) GetModelByName(modelName string) (*shapes.MLModel, error) {
	return client.GetModelByProperty("name", modelName)
}

func (client ModelsClient) GetModelByProperty(propName string, propVal string) (*shapes.MLModel, error) {
	query := map[string]interface{}{
		"query": map[string]interface{}{
			"match": map[string]interface{}{
				propName: propVal,
			},
		},
	}
	models, err := client.searchModels(query)
	if err != nil {
		return nil, err
	}
	if len(models) == 0 {
		errors.New("Model not found.")
	}
	return &models[0], nil
}

func (client ModelsClient) searchModels(query map[string]interface{}) ([]shapes.MLModel, error) {
	queryJSON, err := json.Marshal(query)
	var res *elastic7.Response
	res, err = client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method:           "POST",
		Path:             "/_plugins/_ml/models/_search",
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

	var models []shapes.MLModel
	for _, h := range hits {
		mg, err := shapes.ModelFromMap(h.Source)
		if err != nil {
			return nil, err
		}
		mg.ModelId = h.Id
		models = append(models, *mg)
	}

	return models, nil
}
