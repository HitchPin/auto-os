using System.Reflection;

namespace Summer.Cli;

public class CloudAssembly
{
    public CloudAssembly(string cxi)
    {
        var a = Assembly.LoadFile(cxi);
    }
}