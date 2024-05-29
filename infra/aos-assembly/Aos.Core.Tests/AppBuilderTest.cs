using Aos.Core;
using Microsoft.Extensions.DependencyInjection;

namespace Aos.Core.Tests;

public class AppBuilderTest
{
    [Fact]
    public void CLose()
    {
        
        var b = new AppBuilder()
            .RegisterStack<Dev1>("Dev1")
            .RegisterStack<Dev2>("Dev2",
                (s) => new Dev2(s.GetRequiredService<Dev1>()))
            .RegisterStack<Dev3>("Dev3");
        var ps = b.GetPartialRegistrations();
        Assert.Equal(0, 4);
    }
}