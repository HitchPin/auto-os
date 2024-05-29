using Pulumi;

namespace Aos.Core.Tests;

public class Dev2 : Stack
{
    public Dev2(Dev1 prev)
    {
        var r = new StackReference("Dev1");
        r.GetOutput("asdf").Apply(s => s.ToString());
        RegisterOutputs();
    }
    
    [Output]
    public Input<string> ReExported { get; set; }
}