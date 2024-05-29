using System.Reflection;
using Pulumi;

namespace Summer.Testing;

public static class OutputExtensions
{
    public static async Task<T> AsTask<T>(this Output<T> o)
    {
        var ttype = typeof(Output<T>);
        var prop = ttype.GetProperty("DataTask", BindingFlags.Instance | BindingFlags.NonPublic);
        var r = (Task)prop!.GetValue(o)!;
        await r;
        var resultR = r.GetType().GetProperty("Result").GetValue(r);
        var f = resultR.GetType().GetField("Value").GetValue(resultR);
        return (T)f;
    }
}