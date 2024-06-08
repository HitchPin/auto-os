using System.Collections.Generic;
using System.Text.Json;
using Pulumi;
using Pulumi.AwsNative.Ssm;
using Summer.Core;

namespace Summer.Demo.Dials;

public class SubstrateDials : ResourceRay
{
    public SubstrateDials(ResourceRay parent, string name)
    : base(parent, name)
    {
        var id = ((Season<SummerId>)this.Season).AppId;
        var p = $"/{id.ClusterName}-${id.ClusterId}/substrate/";
        
        var clusterNameParam = new Parameter("ClusterNameParam", new ParameterArgs()
        {
            Name  = p + "clusterName",
            Value = id.ClusterName,
        });
        var clusterIdParam = new Parameter("ClusterIdParam", new ParameterArgs()
        {
            Name  = p + "clusterId",
            Value = id.ClusterId,
        });
        var bootstrapParam = new Parameter("BootstrapParam", new ParameterArgs()
        {
            Name  = p.TrimEnd('/'),
            Value = CreateBootstrapParamJson(clusterNameParam, clusterIdParam)
        });
        BootstrapParamId = bootstrapParam.Id;
    }
    
    public Output<string> BootstrapParamId { get; }

    private Output<string> CreateBootstrapParamJson(
        Parameter clusterNameParam,
        Parameter clusterIdParam)
    {
        return Output.All(clusterNameParam.Id, clusterIdParam.Id).Apply(arr =>
        {
            var clusterName = arr[0];
            var clusterId = arr[1];
            var obj = new Dictionary<string, string>()
            {
                { "ClusterNameParamId", clusterName },
                { "ClusterIdParamId", clusterId },
            };
            return JsonSerializer.Serialize(obj);
        });
    }
}