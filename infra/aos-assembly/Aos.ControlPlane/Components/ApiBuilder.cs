using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Aos.DataModel;
using Aos.PlanarFoundation;
using Pulumi;
using Pulumi.Aws.Lambda;
using Pulumi.AwsApiGateway;
using Pulumi.AwsApiGateway.Inputs;
using Pulumi.AwsNative.Iam;
using Provider = Pulumi.Aws.Provider;

namespace Aos.ControlPlane.Components;

public class ApiBuilder
{
    private readonly RestAPIArgs args;
    private readonly Function handler;
    private readonly ClusterSpec spec;

    public ApiBuilder(Function handler, ClusterSpec spec)
    {
        this.args = new RestAPIArgs()
        {
            Routes = new List<RouteArgs>()
        };
        this.handler = handler;
        this.spec = spec;
    }

    public ApiBuilder AddRoute(Method method, string path)
    {
        this.args.Routes.Add(new RouteArgs() { Path = path, Method = method, EventHandler = this.handler });
        return this;
    }

    public (Output<RestAPI>, Output<ManagedPolicy>) Build(string name, Resource parent)
    {
        var api = new RestAPI(name, this.args, new ComponentResourceOptions() { Parent = parent });
        var cid = Pulumi.Aws.GetCallerIdentity.Invoke();
        var mp = Output.All<string>(
            api.Api.Apply(api => api.Id),
            api.Stage.Apply(stg => stg.StageName), cid.Apply(c => c.AccountId)).Apply(arr =>
        {
            var apiId = arr[0];
            var stageName = arr[1];
            var accountId = arr[2];

            string ArnForRoute(RouteArgs ra)
            {
                return
                    $"arn:aws:execute-api:{spec.Region}:{accountId}:{apiId}/{stageName}/{ra.Method.Value.ToString().ToUpper()}{ra.Path}";
            }

            var arns = args.Routes.Select(r => ArnForRoute(r)).ToList();
            var policyJson = JsonSerializer.Serialize(new Dictionary<string, object?>
            {
                ["Version"] = "2012-10-17",
                ["Statement"] = new[]
                {
                    new Dictionary<string, object?>
                    {
                        ["Effect"] = "Allow",
                        ["Action"] = "execute-api:Invoke",
                        ["Resource"] = arns
                    },
                },
            });
            return new ManagedPolicy("ApiPolicy", new ManagedPolicyArgs()
            {
                ManagedPolicyName = $"{name}-InvokePolicy",
                PolicyDocument = policyJson
            }, new CustomResourceOptions() { Parent = parent });
        });
        return (Output.Create(api), mp);
    }
}