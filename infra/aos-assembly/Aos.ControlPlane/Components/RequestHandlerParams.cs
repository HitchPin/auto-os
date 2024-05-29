using Pulumi;
using Pulumi.AwsNative.S3;
using Pulumi.AwsNative.SecretsManager;
using Pulumi.AwsNative.Ssm;

namespace Aos.ControlPlane.Components;

public record RequestHandlerParams
{
    public Parameter ClusterNameParam { get; set; }
    public Parameter ClusterIdParam { get; set; }
    public Parameter ClusterModeParam { get; set; }
    public Secret RootCASecret { get; set; }
    public Input<string> ClusterSuperAdminSecretId { get; set; }
    public Input<string> DiscoNsName { get; set; }
    public Input<string> DiscoSvcName { get; set; }
    public Input<string> DiscoSvcId { get; set; }
    public Input<string> EventBusName { get; set; }
    public Input<string> DedupeQueueUrl { get; set; }
    public Input<string> ConfBucket { get; set; }
    public Input<string> ConfKey { get; set; }
    public Input<string> LbName { get; set; }
}