using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Aos.PlanarFoundation;
using Pulumi;
using Pulumi.Aws.CloudWatch;
using Pulumi.Aws.Lambda;
using Pulumi.Aws.Lambda.Inputs;
using Pulumi.AwsNative.Events;
using Pulumi.AwsNative.Iam;
using RolePolicyArgs = Pulumi.AwsNative.Iam.Inputs.RolePolicyArgs;

namespace Aos.ControlPlane.Components.Events;

public class EventForwarder : ComponentResource
{
    public Function Func { get; set; }

    public EventForwarder(EventForwarderParams pars, string name, ComponentResourceOptions opts)
        : base("autoos:controlplane:EventForwarder", name, opts)
    {
        var lambdaRole = new Role("requestHandlerRole", new RoleArgs()
        {
            AssumeRolePolicyDocument = IamExtensions.ServicePrincipalTrustPolicy("lambda.amazonaws.com"),
            ManagedPolicyArns = new InputList<string>()
            {
                "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
            },
            Policies = new InputList<RolePolicyArgs>()
            {
                (new RolePolicyArgs()
                {
                    PolicyName = "asg-enricher",
                    PolicyDocument = IamExtensions.SimpleDoc(
                        new [] { "autoscaling:DescribeAutoScalingGroups"},
                        new [] { "*"})
                }),
                pars.EventBusName.Apply(busName => new RolePolicyArgs()
                {
                    PolicyName = "event-putter",
                    PolicyDocument = IamExtensions.SimpleDoc(
                        new [] { "events:PutEvents"},
                        new [] { busName })
                }),
                pars.DedupeQueueArn.Apply(queueArn => new RolePolicyArgs()
                {
                    PolicyName = "dequeuer",
                    PolicyDocument = IamExtensions.SimpleDoc(
                        new []
                        {
                            "sqs:ChangeMessageVisibility",
                            "sqs:DeleteMessage",
                            "sqs:GetQueueAttributes",
                            "sqs:GetQueueUrl",
                            "sqs:ReceiveMessage",
                        },
                        new [] { queueArn })
                })
            }
        });

        var assetArchive = new AssetArchive(new Dictionary<string, AssetOrArchive>
        {
            { "index",  GetForwarder() }
        });
        this.Func = new Function("handlerFunc", new FunctionArgs()
        {
            Role = lambdaRole.Arn,
            Runtime = "python3.12",
            MemorySize = 1024,
            Timeout = (int)TimeSpan.FromSeconds(15).TotalSeconds,
            Handler = "index.handle",
            Code = assetArchive,
            Environment = pars.EventBusName.Apply(busName => new FunctionEnvironmentArgs()
            {
                Variables = new InputMap<string>()
                {
                    {"EVENT_BUS_NAME", busName}
                }
            })
        }, new CustomResourceOptions() { Parent = this });
        new EventSourceMapping("DedupeQueueMapping", new EventSourceMappingArgs()
        {
            BatchSize = 1,
            EventSourceArn = pars.DedupeQueueArn,
            FunctionName = this.Func.Name
        });

        new LogResourcePolicy("AllowEventBridge", new LogResourcePolicyArgs()
        {

        }, new CustomResourceOptions() { Parent = this });
    }

    private static StringAsset GetForwarder()
    {
        string ns = typeof(EventForwarder).Namespace + ".forwarder.py";
        using var s = typeof(EventForwarder).Assembly.GetManifestResourceStream(ns);
        using var reader = new StreamReader(s);
        return new StringAsset(reader.ReadToEnd());
    }
    
}