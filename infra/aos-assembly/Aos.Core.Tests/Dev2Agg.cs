using Pulumi;

namespace Aos.Core.Tests;

public class Dev2Agg : Stack
{
    public Dev2Agg(Dev2 d2, Dev2b d2b, Dev2c d2c)
    {
        var r = new StackReference("Dev1");
        r.GetOutput("asdf").Apply(s => s.ToString());
        RegisterOutputs();
    }
    
    [Output]
    public Input<string> ReExported { get; set; }
}