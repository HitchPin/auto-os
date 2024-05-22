package clients

import (
	"context"
	"fmt"

	"github.com/HitchPin/maestro/common/shapes"
	elastic7 "github.com/olivere/elastic/v7"
)

type TasksClient struct {
	osClient *elastic7.Client
}

func newTasksClient(osClient *elastic7.Client) TasksClient {
	return TasksClient{
		osClient: osClient,
	}
}

func (client TasksClient) GetTask(taskId string) (*shapes.MLTask, error) {

	mlTask := new(shapes.MLTask)
	var res, err = client.osClient.PerformRequest(context.TODO(), elastic7.PerformRequestOptions{
		Method: "GET",
		Path:   "/_plugins/_ml/tasks/" + taskId,
	})
	if err != nil {
		return nil, err
	}

	responseBody := res.Body

	err = shapes.ParseMLTask(string(responseBody), mlTask)
	if err != nil {
		return nil, fmt.Errorf("error unmarshalling response body: %+v: %+v", err, responseBody)
	}

	return mlTask, nil
}
