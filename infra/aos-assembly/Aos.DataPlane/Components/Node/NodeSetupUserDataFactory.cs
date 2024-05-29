using Aos.DataModel;
using Pulumi;
using Config = Pulumi.CloudInit.Config;

namespace Aos.DataPlane.Components.Node;

public static class NodeSetupUserDataFactory
{
    public static Config Create(Resource parent, NodeSpec nodeSpec)
    {
        string src = nodeSpec.Role is NodeRole.Bootstrapper ? Scripts.BootstrapScript : Scripts.NormalScript;
        var b = new CloudInitBuilder()
            .WithSetHostname(new CloudInitBuilder.SetHostnameArgs(false, "bootstrapper-1",
                "bootstrapper-1.search-nodes.internal.hitchpin.com", false, true))
            .WithScript("setup", src);
        return new Pulumi.CloudInit.Config("demo", b.Build(), new CustomResourceOptions() { Parent = parent });
    }
}