using System.Reflection;
using Aos.Core.Graph;

namespace Aos.Core.Tests;

public static class TestExtensions
{
    public static List<PartialStackRegistration> GetPartialRegistrations(this AppBuilder ab)
    {
        var f = typeof(AppBuilder).GetField(
            "registeredStacks", BindingFlags.Instance | BindingFlags.NonPublic);
        return (List<PartialStackRegistration>)f!.GetValue(ab)!;
    }
}