package clients

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/HitchPin/maestro/common/shapes"
	elastic7 "github.com/olivere/elastic/v7"
	"github.com/pkg/errors"
)

type SettingsClient struct {
	osClient *elastic7.Client
}

func newSettingsClient(osClient *elastic7.Client) SettingsClient {
	return SettingsClient{
		osClient: osClient,
	}
}

func (client SettingsClient) GetMlSettings() (*shapes.MlClusterSettings, error) {

	var err error
	var response *elastic7.Response
	var jsonBytes []byte

	response, err = client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "GET",
		Path:   "/_cluster/settings",
		Params: map[string][]string{
			"flat_settings": []string{"true"},
		},
	})
	if err != nil {
		return nil, err
	}
	jsonBytes = response.Body
	clusterSettings := map[string]interface{}{}
	err = json.Unmarshal(jsonBytes, &clusterSettings)
	if err != nil {
		f := fmt.Sprintf("Fetching ML cluster settings returned a status code of %s.", response.StatusCode)
		werr := errors.Wrap(err, f)
		return nil, werr
	}

	var cs = shapes.MlClusterSettings{}
	pSettings := clusterSettings["persistent"].(map[string]interface{})
	if memory, ok := pSettings["plugins.ml_commons.memory_feature_enabled"]; ok {
		var memoryBool = memory.(string) == "true"
		cs.EnableMemory = &memoryBool
	}
	if mlDataNode, ok := pSettings["plugins.ml_commons.enable_ml_on_data_nodes"]; ok {
		var mlDataNodeBool = mlDataNode.(string) == "true"
		cs.AllowMlOnDataNodes = &mlDataNodeBool
	}
	if rag, ok := pSettings["plugins.ml_commons.rag_pipeline_feature_enabled"]; ok {
		var ragBool = rag.(string) == "true"
		cs.EnableRagPipeline = &ragBool
	}
	if ac, ok := pSettings["plugins.ml_commons.model_access_control_enabled"]; ok {
		var acBool = ac.(string) == "true"
		cs.EnableModelAccessControl = &acBool
	}
	if cac, ok := pSettings["plugins.ml_commons.connector_access_control_enabled"]; ok {
		var cacBool = cac.(string) == "true"
		cs.EnableConnectorAccessControl = &cacBool
	}

	if eps, ok := pSettings["plugins.ml_commons.trusted_connector_endpoints_regex"]; ok {
		epIfaces := eps.([]interface{})
		epStrs := []string{}
		for _, i := range epIfaces {
			epStrs = append(epStrs, i.(string))
		}
		cs.TrustedConnectorEndpointsRegex = epStrs
	}

	return &cs, nil
}

func (client SettingsClient) PutMlSettings(req shapes.MlClusterSettings) error {

	var err error
	var jsonBytes []byte

	pSettings := map[string]interface{}{}
	if req.EnableMemory != nil {
		pSettings["plugins.ml_commons.memory_feature_enabled"] = *req.EnableMemory
	}
	if req.AllowMlOnDataNodes != nil {
		inverted := !(*req.AllowMlOnDataNodes)
		pSettings["plugins.ml_commons.only_run_on_ml_node"] = inverted
	}
	if req.EnableRagPipeline != nil {
		pSettings["plugins.ml_commons.rag_pipeline_feature_enabled"] = *req.EnableRagPipeline
	}
	if req.EnableModelAccessControl != nil {
		pSettings["plugins.ml_commons.model_access_control_enabled"] = *req.EnableModelAccessControl
	}
	if req.EnableConnectorAccessControl != nil {
		pSettings["plugins.ml_commons.connector_access_control_enabled"] = *req.EnableConnectorAccessControl
	}
	if req.TrustedConnectorEndpointsRegex != nil && len(req.TrustedConnectorEndpointsRegex) > 0 {
		pSettings["plugins.ml_commons.trusted_connector_endpoints_regex"] = req.TrustedConnectorEndpointsRegex
	}

	body := map[string]interface{}{
		"persistent": pSettings,
	}
	jsonBytes, err = json.Marshal(body)
	if err != nil {
		return err
	}
	_, err = client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "PUT",
		Path:   "/_cluster/settings",
		Body:   string(jsonBytes),
	})
	if err != nil {
		return err
	}
	return nil
}

func (client SettingsClient) EnableMlOnDataNodes() error {

	var err error
	var jsonBytes []byte

	body := map[string]interface{}{
		"persistent": map[string]interface{}{
			"plugins.ml_commons.only_run_on_ml_node": false,
		},
	}
	jsonBytes, err = json.Marshal(body)
	if err != nil {
		return err
	}
	_, err = client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "PUT",
		Path:   "/_cluster/settings",
		Body:   string(jsonBytes),
	})
	if err != nil {
		return err
	}
	return nil
}
