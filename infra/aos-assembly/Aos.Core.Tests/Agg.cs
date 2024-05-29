using Pulumi;

namespace Aos.Core.Tests;

public class Agg : Stack
{
    public Agg(Dev1 d1, Dev2 d2, Dev3 d3)
    {
    }
    
    [Output]
    public Input<string> BucketName { get; set; }
}