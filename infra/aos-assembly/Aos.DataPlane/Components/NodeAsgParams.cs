using System.Collections.Generic;
using Aos.DataModel;

namespace Aos.DataPlane.Components;

public record NodeAsgParams
{
    public List<string> NodeSecurityGroupIds { get; set; }
    public NodeSpec Spec { get; set; }
    public ClusterSpec ClusterSpec { get; set; }
    public string InstanceRoleArn { get; set; }
    public bool ImmuneFromHealthChecks { get; set; }
    public CapacityProviderSpec.EC2AutoScalingCapacityProvider Capacity { get; set; }
}