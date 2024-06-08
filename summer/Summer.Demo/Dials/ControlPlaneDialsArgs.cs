using Pulumi;
using Pulumi.AwsNative.SecretsManager;

namespace Summer.Demo.Dials;

public class ControlPlaneDialsArgs
{
    public Secret RootCertificate { get; set; }
    public Secret SuperAdminPassword { get; set; }
    
    /*
    public Input<string> EventBusName { get; set; }
    public Input<string> EventLogGroupName { get; set; }
    */
}