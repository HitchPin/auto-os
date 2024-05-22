package clients

import (
	"context"
	"encoding/json"
	elastic7 "github.com/olivere/elastic/v7"
	"strings"
)

type KnnClient struct {
	osClient *elastic7.Client
}

type WarmupResult struct {
	TotalShards int
	Successful  int
	Failed      int
}

func newKnnClient(osClient *elastic7.Client) KnnClient {
	return KnnClient{
		osClient: osClient,
	}
}

func (client KnnClient) WarmupIndices(indices []string) (*WarmupResult, error) {
	res, err := client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "GET",
		Path:   "/_plugins/_knn/warmup/" + strings.Join(indices, ","),
	})
	if err != nil {
		return nil, err
	}

	response := new(map[string]interface{})
	err = json.Unmarshal([]byte(res.Body), &response)
	if err != nil {
		return nil, err
	}

	responseObj := *response
	shardsIface := responseObj["_shards"].(map[string]interface{})

	r := WarmupResult{
		TotalShards: shardsIface["total"].(int),
		Successful:  shardsIface["successful"].(int),
		Failed:      shardsIface["failed"].(int),
	}
	return &r, nil
}
