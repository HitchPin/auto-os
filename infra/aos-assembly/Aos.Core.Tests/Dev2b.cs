using Pulumi;

namespace Aos.Core.Tests;

public class Dev2b : Stack
{
    public Dev2b(Dev1 prev)
    {
        var r = new StackReference("Dev1");
        r.GetOutput("asdf").Apply(s => s.ToString());
        RegisterOutputs();
    }
    
    [Output]
    public Input<string> ReExported { get; set; }
}