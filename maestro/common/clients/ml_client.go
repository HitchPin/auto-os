package clients

import (
	elastic7 "github.com/olivere/elastic/v7"
)

type MlClient struct {
	osClient *elastic7.Client
}

func NewMlClient(osClient *elastic7.Client) MlClient {
	return MlClient{
		osClient: osClient,
	}
}
func (client MlClient) Tasks() TasksClient {
	return newTasksClient(client.osClient)
}
func (client MlClient) ModelGroups() ModelGroupsClient {
	return newModelGroupsClient(client.osClient)
}
func (client MlClient) Models() ModelsClient {
	return newModelsClient(client.osClient)
}
func (client MlClient) Settings() SettingsClient {
	return newSettingsClient(client.osClient)
}
func (client MlClient) SearchPipelines() SearchPipelineClient {
	return newSearchPipelineClient(client.osClient)
}
func (client MlClient) Connectors() ConnectorClient {
	return newConnectorClient(client.osClient)
}
func (client MlClient) Knn() KnnClient {
	return newKnnClient(client.osClient)
}
