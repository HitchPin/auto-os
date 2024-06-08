using System.Threading.Tasks;
using Pulumi;
using Pulumi.AwsNative.SecretsManager;
using Pulumi.AwsNative.SecretsManager.Inputs;
using Summer.Core;
using Summer.Demo.Dials;
using SM = Pulumi.AwsNative.SecretsManager;

namespace Summer.Demo;

public class SummerSeason : Season<SummerId>
{
    public SummerSeason(App<SummerId> app, string name, SummerId id) : base(app, name, id)
    {
    }

    public override async Task ConstructCloudResourcesAsync()
    {
        var s = new SubstrateDials(this, "Substrate");

        var caCert = new ClusterRootCertificate(this, "RootCert");
        var superAdminSecret = new SM.Secret("asdf", new SecretArgs()
        {
            Name = AppId.ParameterPathPrefix + "controlPlane/superAdminCredentials",
            GenerateSecretString = new SecretGenerateSecretStringArgs()
        }, new CustomResourceOptions() { Parent = this.UnderlyingResource});
        
        var d = new ControlPlaneDials(this, "ControlPlane", new ControlPlaneDialsArgs()
        {
            RootCertificate = caCert.CertificateSecret,
            SuperAdminPassword = superAdminSecret
        });  
    }
}