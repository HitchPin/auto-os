using Aos.PlanarFoundation;
using Pulumi;
using ApiGW = Pulumi.AwsApiGateway;
using ManagedPolicy = Pulumi.AwsNative.Iam.ManagedPolicy;

namespace Aos.ControlPlane.Components;

class ApiDefinition : ComponentResource
{
    public ApiDefinition(ApiDefinitionParams pars, string name, ComponentResourceOptions opts)
        : base("autoos:controlplane:ApiDefinition", name, opts)
    {

        var h = pars.Handler.LambdaFunc;
        var spec = pars.Spec;
        var (restApi, managedPolicy) = new ApiBuilder(h, spec)
            .AddRoute(ApiGW.Method.POST, "/certificates/issue")
            .AddRoute(ApiGW.Method.GET, "/certificates/root")
            .AddRoute(ApiGW.Method.POST, "/configuration/opensearch")
            .AddRoute(ApiGW.Method.POST, "/configuration/cwagent")
            .AddRoute(ApiGW.Method.POST, "/register")
            .AddRoute(ApiGW.Method.POST, "/cluster/curl")
            .AddRoute(ApiGW.Method.POST, "/signal/init-fail")
            .Build( $"{spec.ClusterName}{spec.ClusterId}-MaestroApi", this);
        this.RestAPI = restApi;
        this.MaestroPolicy = managedPolicy;
    }
    
    public Output<ApiGW.RestAPI> RestAPI { get; }
    public Output<ManagedPolicy> MaestroPolicy { get; }
}