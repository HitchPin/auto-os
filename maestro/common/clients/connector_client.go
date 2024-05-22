package clients

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/HitchPin/maestro/common/shapes"
	elastic7 "github.com/olivere/elastic/v7"
)

type ConnectorClient struct {
	osClient *elastic7.Client
}

type CreateConnectorResponse struct {
	ConnectorId string `json:"connector_id"`
}

func newConnectorClient(osClient *elastic7.Client) ConnectorClient {
	return ConnectorClient{
		osClient: osClient,
	}
}

func (client ConnectorClient) CreateConnector(req shapes.MLConnector) (*CreateConnectorResponse, error) {

	var (
		err       error
		res       *elastic7.Response
		jsonBytes []byte
	)
	response := new(CreateConnectorResponse)

	jsonBytes, err = json.Marshal(req)
	reqPath := "/_plugins/_ml/connectors/_create"
	slog.Debug("Creating connector.",
		"method", "POST",
		"path", reqPath,
		"body", string(jsonBytes))

	res, err = client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method:           "POST",
		Path:             reqPath,
		Body:             string(jsonBytes),
		RetryStatusCodes: []int{http.StatusConflict, http.StatusInternalServerError},
		Retrier: elastic7.NewBackoffRetrier(
			elastic7.NewExponentialBackoff(100*time.Millisecond, 30*time.Second),
		),
	})
	if err != nil {
		slog.Error("Failed to create connector. The HTTP request failed in a non-recoverable way.",
			"error", err)
		return nil, err
	}

	responseBody := res.Body
	slog.Debug("Received response from CreateConnector request.",
		"statusCode", res.StatusCode,
		"body", string(responseBody))

	if err := json.Unmarshal(responseBody, response); err != nil {
		slog.Error("Unable to unmarshal response body into JSON.",
			"error", err)
		return nil, err
	}

	return response, nil
}

func (client ConnectorClient) GetConnectorById(connectorId string) (*shapes.MLConnector, error) {

	reqPath := "/_plugins/_ml/connectors/" + connectorId
	slog.Debug("Fetching connector by id.",
		"method", "GET",
		"path", reqPath)
	res, err := client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "GET",
		Path:   reqPath,
	})
	if err != nil {
		return nil, err
	}
	responseBody := res.Body
	slog.Debug("Received response from GetConnector request.",
		"statusCode", res.StatusCode,
		"body", string(responseBody))

	connector := new(shapes.MLConnector)

	if err := json.Unmarshal(responseBody, connector); err != nil {
		slog.Error("Unable to unmarshal response body into JSON.",
			"error", err)
		return nil, err
	}

	connector.ConnectorId = connectorId
	return connector, nil
}

func (client ConnectorClient) DeleteConnector(connectorId string) error {

	reqPath := "/_plugins/_ml/connectors/" + connectorId
	slog.Debug("Deleting connector by id.",
		"method", "DELETE",
		"path", reqPath)
	response, err := client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "DELETE",
		Path:   reqPath,
	})
	if err != nil {
		return err
	}

	m := map[string]interface{}{}
	slog.Debug("Received response from GetConnector request.",
		"statusCode", response.StatusCode,
		"body", string(response.Body))

	err = json.Unmarshal([]byte(response.Body), &m)
	if err != nil {
		slog.Error("Unable to unmarshal response body into JSON.",
			"error", err)
		return err
	}

	result := m["result"].(string)
	if result != "deleted" {
		return errors.New("Result of delete operation was " + result)
	}
	return nil
}

func (client ConnectorClient) ListConnectors() ([]shapes.MLConnector, error) {
	var connectors []shapes.MLConnector
	query := map[string]interface{}{
		"query": map[string]interface{}{
			"match_all": map[string]interface{}{},
		},
	}
	connectors, err := client.searchConnectors(query)
	if err != nil {
		return connectors, err
	}
	return connectors, nil
}

func (client ConnectorClient) searchConnectors(query map[string]interface{}) ([]shapes.MLConnector, error) {
	queryJSON, err := json.Marshal(query)

	reqPath := "/_plugins/_ml/connectors/_search"
	slog.Debug("Searching connectors by query.",
		"method", "POST",
		"path", reqPath,
		"body", queryJSON)

	var res *elastic7.Response
	res, err = client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method:           "POST",
		Path:             reqPath,
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
	slog.Debug("Received response from SearchConnectors request.",
		"statusCode", res.StatusCode,
		"body", string(responseBody))

	response := new(shapes.SearchResponse)
	err = json.Unmarshal([]byte(responseBody), &response)
	if err != nil {
		slog.Error("Unable to unmarshal response body into JSON.", slog.Any("error", err))
		return nil, err
	}
	hits := response.Hits.Hits

	var connectors []shapes.MLConnector
	for _, h := range hits {
		c, err := shapes.ConnectorFromMap(h.Source)
		if err != nil {
			return nil, err
		}
		c.ConnectorId = h.Id
		connectors = append(connectors, *c)
	}

	return connectors, nil
}
