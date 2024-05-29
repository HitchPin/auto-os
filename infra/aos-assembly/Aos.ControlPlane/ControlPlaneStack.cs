using Aos.ControlPlane.Components;
using Aos.ControlPlane.Components.Events;
using Aos.DataModel;
using Aos.PlanarFoundation;
using Aos.Substrate;
using Pulumi;
using Pulumi.Aws.ServiceDiscovery;
using Pulumi.AwsNative.SecretsManager;
using Pulumi.AwsNative.Ssm;

namespace Aos.ControlPlane;

public class ControlPlaneStack: PlanarStack, IPlanarStack
{
    public ControlPlaneStack(SubstrateStack ss)
    {

        var service = new Service("SvcDisco", new ServiceArgs()
        {
            Name = Spec.GetHyphenatedPrefix() + "search-nodes",
            NamespaceId = ss.DiscoNamespaceId.Apply(a => (string)a!)
        });

        var eventNotifications = new EventNotifications(Spec, "EventNotifications", new ComponentResourceOptions() { Parent = this });

        var caSecret = new Secret("CASecret", new SecretArgs()
        {
            Name = Spec.GetQualifiedPrefix() + "/maestro/rootCa"
        }, new CustomResourceOptions() { Parent = this });
        var clusterNameParam = new Parameter("ClusterNameParam", new ParameterArgs()
        {
            Name = Spec.GetQualifiedPrefix() + "/maestro/clusterName",
            DataType = ParameterDataType.Text,
            Tier = ParameterTier.IntelligentTiering,
            Type = ParameterType.String,
            Value = Spec.ClusterName
        }, new CustomResourceOptions() { Parent = this });
        var clusterIdParam = new Parameter("ClusterIdParam", new ParameterArgs()
        {
            Name = Spec.GetQualifiedPrefix() + "/maestro/clusterId",
            DataType = ParameterDataType.Text,
            Tier = ParameterTier.IntelligentTiering,
            Type = ParameterType.String,
            Value = Spec.ClusterId
        }, new CustomResourceOptions() { Parent = this });
        var clusterModeParam = new Parameter("ClusterModeParam", new ParameterArgs()
        {
            Name = Spec.GetQualifiedPrefix() + "/maestro/clusterMode",
            DataType = ParameterDataType.Text,
            Tier = ParameterTier.IntelligentTiering,
            Type = ParameterType.String,
            Value = "bootstrapping"
        }, new CustomResourceOptions() { Parent = this });
        
        
        var handlerPars = new RequestHandlerParams()
        {
            ClusterIdParam = clusterIdParam,
            ClusterModeParam = clusterModeParam,
            ClusterNameParam = clusterNameParam,
            ClusterSuperAdminSecretId = ss.SuperAdminSecretId,
            DiscoNsName = ss.DiscoNamespaceName,
            DiscoSvcId = service.Id,
            DiscoSvcName = service.Name,
            EventBusName = eventNotifications.Bus.Name,
            DedupeQueueUrl = eventNotifications.EventDedupeQueue.QueueUrl,
            RootCASecret = caSecret,
            ConfBucket = ss.ConfBucketName,
            ConfKey = "",
            LbName = Spec.GetTitledPrefix() + "SearchCluster"
        };
        var handler = new RequestHandler("handler", handlerPars, new ComponentResourceOptions() { Parent = this });
        var apiDef = new ApiDefinition(new ApiDefinitionParams()
        {
             Spec = Spec,
            Handler = handler
        }, "ApiDef", new ComponentResourceOptions() { Parent = this });
        this.MaestroApiPolicyArn = apiDef.MaestroPolicy.Apply(mp => mp.PolicyArn);
        this.MaestroEndpoint = apiDef.RestAPI.Apply(api => api.Url);
        this.DiscoServiceId = service.Id;
        this.DiscoServiceName = service.Name;
        this.MaestroEventPolicyArn = eventNotifications.EventSubmittedPolicyArn;
    }

    [Output]
    public Output<string> MaestroEventPolicyArn { get; set; }
    [Output]
    public Output<string> MaestroApiPolicyArn { get; set; }
    [Output]
    public Output<string> MaestroEndpoint { get; set; }
    [Output]
    public Output<string> DiscoServiceId { get; set; }
    [Output]
    public Output<string> DiscoServiceName { get; set; }
    
    public static string Name => "ControlPlane";
}