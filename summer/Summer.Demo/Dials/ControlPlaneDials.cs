using System.Collections.Generic;
using System.Text.Json;
using Pulumi;
using Pulumi.AwsNative.SecretsManager;
using Pulumi.AwsNative.Ssm;
using Summer.Core;

namespace Summer.Demo.Dials;

public class ControlPlaneDials : ResourceRay
{
    public ControlPlaneDials(ResourceRay parent, string name, ControlPlaneDialsArgs args)
    : base(parent, name)
    {
        var id = ((Season<SummerId>)this.Season).AppId;
        var p = $"/{id.ClusterName}-${id.ClusterId}/controlPlane/";

        var clusterModeParam = new Parameter("ClusterModeParam", new ParameterArgs()
        {
            Name  = p + "clusterMode",
            Value = "bootstrapping",
        });
        
        var bootstrapParam = new Parameter("BootstrapParam", new ParameterArgs()
        {
            Name  = p.TrimEnd('/'),
            Value = CreateBootstrapParamJson(
                clusterModeParam, args.RootCertificate, args.SuperAdminPassword)
        });
        BootstrapParamId = bootstrapParam.Id;
    }
    
    public Output<string> BootstrapParamId { get; }

    private Output<string> CreateBootstrapParamJson(
        Parameter clusterModeParam,
        Secret rootCaSecretSecret,
        Secret superAdminPwdSecret)
    {
        return Output.All(clusterModeParam.Id, rootCaSecretSecret.Id, superAdminPwdSecret.Id).Apply(arr =>
        {
            var clusterMode = arr[0];
            var rootCaSecret = arr[1];
            var superAdminPwdSecret = arr[2];
            var obj = new Dictionary<string, string>()
            {
                { "ClusterModeParamId", clusterMode },
                { "RootCertificateSecretId", rootCaSecret },
                { "AdminPasswordSecretId", superAdminPwdSecret },
            };
            return JsonSerializer.Serialize(obj);
        });
    }
}