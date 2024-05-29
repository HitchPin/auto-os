using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Aos.PlanarFoundation;
using Pulumi;
using Pulumi.Aws.Iam;
using Pulumi.Aws.Iam.Inputs;
using Pulumi.Aws.Lambda;
using Pulumi.Aws.Lambda.Inputs;

namespace Aos.ControlPlane.Components;

public class RequestHandler : ComponentResource
{
    public RequestHandler(string name, RequestHandlerParams pars, ComponentResourceOptions opts)
        : base("autoos:controlplane:RequestHandler", name, opts)
    {
        var cid = Pulumi.Aws.GetCallerIdentity.Invoke();
        var lambdaRole = new Role("requestHandlerRole", new RoleArgs()
        {
            AssumeRolePolicy = IamExtensions.ServicePrincipalTrustPolicy("lambda.amazonaws.com"),
            InlinePolicies = new InputList<RoleInlinePolicyArgs>()
            {
                Output.All<string>(new []{
                    pars.ClusterNameParam.Name!,
                    pars.ClusterModeParam.Name!,
                    pars.ClusterIdParam.Name!,
                    cid.Apply(c => c.AccountId)
                    }).Apply(arr =>
                {
                    var nameParam = arr[0];
                    var modeParam = arr[1];
                    var idParam = arr[2];
                    var accountId = arr[3];
                    return new RoleInlinePolicyArgs()
                    {
                        Name = "allow-param-read",
                        Policy = IamExtensions.SimpleDoc(new[]
                        {
                            "ssm:PutParameter",
                            "ssm:LabelParameterVersion",
                            "ssm:UnlabelParameterVersion",
                            "ssm:GetParameterHistory",
                            "ssm:GetParametersByPath",
                            "ssm:GetParameters",
                            "ssm:GetParameter"
                        }, new string[]
                        {
                            nameParam, modeParam, idParam
                        }.Select(p => $"arn:aws:ssm:*:{accountId}:parameter/" + p.TrimStart('/')).ToArray())
                    };
                })
            }
        });
        
        var asset = new FileArchive("/Users/john/project-maestro/dist/bin/maestro/lambda/package.zip");

        var handlerFunc = new Function("handlerFunc", new FunctionArgs()
        {
            Role = lambdaRole.Arn,
            Runtime = "provided.al2023",
            MemorySize = 1024,
            Timeout = (int)TimeSpan.FromSeconds(60).TotalSeconds,
            Handler = "handle",
            Architectures = "arm64",
            Code = asset,
            Environment = new FunctionEnvironmentArgs()
            {
               Variables = new InputMap<string>()
               {
                   {"ROOT_CA_SECRET_ID", pars.RootCASecret.Id },
                   {"CLUSTER_NAME_PARAM_NAME", pars.ClusterNameParam.Name! },
                   {"CLUSTER_MODE_PARAM_NAME", pars.ClusterModeParam.Name! },
                   {"CONF_BUCKET", pars.ConfBucket! },
                   {"CONF_KEY_PREFIX", pars.ConfKey! },
                   {"CLUSTER_ADMIN_SECRET_ID", pars.ClusterSuperAdminSecretId },
                   {"DISCO_SVC_ID", pars.DiscoSvcId! },
                   {"DISCO_NS_NAME", pars.DiscoNsName! },
                   {"DISCO_SVC_NAME", pars.DiscoSvcName! },
                   {"EVENT_BUS_NAME", pars.EventBusName },
                   {"EVENT_DEDUPE_QUEUE_URL", pars.DedupeQueueUrl! },
                   {"LB_NAME",  pars.LbName! },
               }
            }
        }, new CustomResourceOptions() { Parent = this });

        this.LambdaFunc = handlerFunc;
    }
    
    public Function LambdaFunc { get; private set; }
}