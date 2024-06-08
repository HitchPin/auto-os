using Summer.Core;

namespace Summer.Demo;

public class SummerId(string clusterName, string clusterId) : IAppIdentifier
{
    public string ClusterName => clusterName;
    public string ClusterId => clusterId;

    public string Id => TitlePrefix;
    public string TitlePrefix => $"{ClusterName}{ClusterId}";
    public string ParameterPathPrefix =>  $"/{ClusterName}{ClusterId}/";
}