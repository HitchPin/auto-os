using System.Text;
using Aos.DataModel;
using Pulumi;

namespace Aos.PlanarFoundation;

public abstract class PlanarStack : Stack
{
    private readonly ClusterSpec spec;

    public PlanarStack()
    {
        var specJson = new Config(Deployment.Instance.ProjectName).Require(ClusterSpec.ConfigKey);
        var utf8 = Convert.FromBase64String(specJson);
        this.spec = ClusterSpec.FromJson(Encoding.UTF8.GetString(utf8));
    }

    protected ClusterSpec Spec => spec;

}