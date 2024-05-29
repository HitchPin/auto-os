using Aos.DataModel;
using Pulumi;

namespace Aos.DataPlane.Components;

public class SearchClusterParams
{
    public Input<string> MaestroPolicyArn { get; set; }
    public Input<string> MaestroEndpoint { get; set; }
    public ClusterSpec Spec { get; set; }
}