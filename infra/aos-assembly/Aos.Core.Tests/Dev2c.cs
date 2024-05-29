using Pulumi;

namespace Aos.Core.Tests;

public class Dev2c : Stack
{
    public Dev2c(Dev1 prev)
    {
        var r = new StackReference("Dev1");
        r.GetOutput("asdf").Apply(s => s.ToString());
        RegisterOutputs();
    }
    
    [Output]
    public Input<string> ReExported { get; set; }
}