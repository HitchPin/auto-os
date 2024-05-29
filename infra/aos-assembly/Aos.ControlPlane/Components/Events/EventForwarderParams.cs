using Pulumi;

namespace Aos.ControlPlane.Components.Events;

public class EventForwarderParams
{
    public Input<string> EventBusName { get; set; }
    public Input<string> DedupeQueueArn { get; set; }
}