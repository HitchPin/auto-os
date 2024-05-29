using Pulumi;

namespace Aos.Core.Tests;

public class Dev3 : Stack
{
    public Dev3()
    {
        var r = new StackReference("Dev2");
        r.GetOutput("asdf").Apply(s => s.ToString());
        RegisterOutputs();
    }
    
    [Output]
    public Input<string> ReExported { get; set; }
}