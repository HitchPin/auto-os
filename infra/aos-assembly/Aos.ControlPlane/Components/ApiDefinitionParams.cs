using Aos.DataModel;

namespace Aos.ControlPlane.Components;

public record ApiDefinitionParams
{
    public ClusterSpec Spec { get; set; }
    public RequestHandler Handler { get; set; }
}