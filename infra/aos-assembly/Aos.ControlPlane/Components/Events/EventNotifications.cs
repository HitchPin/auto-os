using System.Collections.Generic;
using Aos.DataModel;
using Aos.PlanarFoundation;
using Pulumi;
using Pulumi.AwsNative.Events;
using Pulumi.AwsNative.Events.Inputs;
using Pulumi.AwsNative.Iam;
using Pulumi.AwsNative.Logs;
using Pulumi.AwsNative.Sqs;

namespace Aos.ControlPlane.Components.Events;

public class EventNotifications : ComponentResource
{
    public LogGroup EventStreamLogs { get; set; }
    public Queue EventDedupeQueue { get; set; }
    public EventBus Bus { get; set; }
    public EventForwarder Forwarder { get; set; }
    
    public EventNotifications(ClusterSpec spec, string name, ComponentResourceOptions opts)
        : base("autoos:controlplane:EventNotifications", name, opts)
    {
        this.EventDedupeQueue = new Queue("DedupeQueue", new QueueArgs()
        {
            QueueName = spec.GetHyphenatedPrefix() + "-maestro-deduper.fifo",
            ContentBasedDeduplication = true,
            FifoQueue = true,
        });
        this.Bus = new EventBus("Bus", new EventBusArgs()
        {
            EventSourceName = spec.GetHyphenatedPrefix() + "-maestro"
        });
        this.EventStreamLogs = new LogGroup("StreamedEvents", new LogGroupArgs()
        {
            LogGroupName = spec.GetTitledPrefix() + "MaestroEvents"
        });
        this.EventSubmittedPolicyArn =
            Output.All<string>(Bus.Arn, EventDedupeQueue.Arn).Apply(arr =>
            {
                var busArn = arr[0];
                var queueArn = arr[1];
                var mp = new ManagedPolicy("SubmitterPolicy", new ManagedPolicyArgs()
                {
                    ManagedPolicyName = spec.GetTitledPrefix() + "MaestroEventSubmitter",
                    PolicyDocument = IamExtensions.SimpleDoc(
                        new IamExtensions.SimpleStatement(new []{ "events:PutEvents" }, new []{ busArn }),
                        new IamExtensions.SimpleStatement(new []{ "sqs:SendMessage", "sqs:SendMessageBatch" }, new []{ queueArn }))
                }, new CustomResourceOptions() { Parent = this });
                return mp.PolicyArn;
            });

        new Rule("BakeryRule", new RuleArgs()
        {
            Name = spec.GetTitledPrefix() + "MaestroBakeryRule",
            EventPattern = new Dictionary<string, object?>
            {
                ["detailType"] = new[] { "EC2 Image Builder Image State Change" },
                ["source"] = new[] { "aws.imagebuilder" },
                ["resources"] = new[]
                {
                    new Dictionary<string, object?>()
                    {
                        { "prefix", "2017-10-02" }
                    }
                }
            }
        }, new CustomResourceOptions() { Parent = this });
        
        new Rule("BroadcastRule", new RuleArgs()
        {
            Name = spec.GetTitledPrefix() + "MaestroBroadcastRule",
            EventBusName = this.Bus.Name,
            EventPattern = new Dictionary<string, object?>
            {
                ["source"] = new[] { "maestro" }
            },
            Targets = new InputList<RuleTargetArgs>()
            {
                new RuleTargetArgs()
                {
                    Arn = this.EventStreamLogs.Arn
                }
            }
        }, new CustomResourceOptions() { Parent = this });

        this.Forwarder = new EventForwarder(new EventForwarderParams()
        {
            EventBusName = this.Bus.Name,
            DedupeQueueArn = this.EventDedupeQueue.Arn
        },"Forwarder", new ComponentResourceOptions() { Parent = this });
    }
    
    public Output<string> EventSubmittedPolicyArn { get; set; }
}