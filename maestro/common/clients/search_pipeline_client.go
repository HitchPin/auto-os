package clients

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/HitchPin/maestro/common/shapes"
	elastic7 "github.com/olivere/elastic/v7"
)

type SearchPipelineClient struct {
	osClient *elastic7.Client
}

func newSearchPipelineClient(osClient *elastic7.Client) SearchPipelineClient {
	return SearchPipelineClient{
		osClient: osClient,
	}
}

type CreateHybridSearchPipelineRequest struct {
	Name     *string
	Pipeline *shapes.SearchPipeline
}

func (client SearchPipelineClient) CreateSearchPipeline(request CreateHybridSearchPipelineRequest) error {

	var err error
	var jsonBytes []byte

	pipeline := *request.Pipeline
	jsonBytes, err = json.Marshal(pipeline)
	if err != nil {
		return err
	}
	_, err = client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "PUT",
		Path:   "/_search/pipeline/" + *request.Name,
		Body:   string(jsonBytes),
	})
	if err != nil {
		return err
	}

	return nil
}

func (client SearchPipelineClient) GetSearchPipeline(pipelineName string) (*shapes.SearchPipeline, error) {
	res, err := client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "GET",
		Path:   "/_search/pipeline/" + pipelineName,
	})

	iface := new(map[string]interface{})
	err = json.Unmarshal(res.Body, iface)
	if err != nil {
		return nil, err
	}
	ifaceMap := *iface
	pipeMap := ifaceMap[pipelineName].(map[string]interface{})
	pipeMapJsonBytes, err := json.Marshal(pipeMap)
	if err != nil {
		return nil, err
	}
	sp := new(shapes.SearchPipeline)
	err = shapes.ParseSearchPipeline(string(pipeMapJsonBytes), sp)
	if err != nil {
		return nil, err
	}
	return sp, nil
}

func (client SearchPipelineClient) DeleteSearchPipeline(pipelineName string) error {
	response, err := client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "DELETE",
		Path:   "/_search/pipeline/" + pipelineName,
	})
	fmt.Printf("Delete response:\n" + string(response.Body))

	if err != nil {
		return err
	}
	return nil
}
