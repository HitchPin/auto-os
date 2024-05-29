using Aos.Core.Graph;
using Microsoft.Extensions.DependencyInjection;

namespace Aos.Core.Tests.Graph;

public class StackGraphTest
{
    private static AppBuilder SimpleAppBuilder() => new AppBuilder()
        .RegisterStack<Dev1>("Dev1")
        .RegisterStack<Dev2>("Dev2",
            (s) => new Dev2(s.GetRequiredService<Dev1>()))
        .RegisterStack<Dev3>("Dev3");

    private static AppBuilder RepetitiveBuilder() => new AppBuilder()
        .RegisterStack<Dev1>("Dev1")
        .RegisterStack<Dev2>("Dev2",
            (s) => new Dev2(s.GetRequiredService<Dev1>()))
        .RegisterStack<Dev2b>("Dev2b",
            (s) => new Dev2b(s.GetRequiredService<Dev1>()))
        .RegisterStack<Dev2c>("Dev2c",
            (s) => new Dev2c(s.GetRequiredService<Dev1>()))
        .RegisterStack<Dev2Agg>("Dev2Agg",
            (s) => new Dev2Agg(
                s.GetRequiredService<Dev2>(),
                s.GetRequiredService<Dev2b>(),
                s.GetRequiredService<Dev2c>()));

    
    private static AppBuilder ComplexAppBuilder() => new AppBuilder()
        .RegisterStack<Dev1>("Dev1")
        .RegisterStack<Dev2>("Dev2",
            (s) => new Dev2(s.GetRequiredService<Dev1>()))
        .RegisterStack<Dev3>("Dev3")
        .RegisterStack<Agg>("Agg", (s) =>
            new Agg(
                s.GetRequiredService<Dev1>(),
                s.GetRequiredService<Dev2>(),
                s.GetRequiredService<Dev3>()));
    
    [Fact]
    public void ConvertsPartialToCompleteRegistrations()
    {
        var b = SimpleAppBuilder();
        var partials = b.GetPartialRegistrations();
        Assert.Equal(3, partials.Count);
        var fulls = StackGraph.PartialToFullRegistrations(partials);
        
        Assert.Equal(3, fulls.Count);
        var fullsByType = fulls.ToDictionary(f => f.StackType);
        var d1 = fullsByType[typeof(Dev1)];
        var d2 = fullsByType[typeof(Dev2)];
        var d3 = fullsByType[typeof(Dev3)];
        Assert.Equal(0, d1.Dependencies.Count!);
        Assert.Equal(1, d2.Dependencies.Count);
        Assert.Equal(d1, d2.Dependencies[0]);
        Assert.Equal(0, d3.Dependencies.Count);
    }

    [Fact]
    public void IdentifiesBuildOrder()
    {
        var partials = ComplexAppBuilder().GetPartialRegistrations();
        var fulls = StackGraph.PartialToFullRegistrations(partials);
        var cb = new StackGraph(partials);

        var fullsByType = fulls.ToDictionary(f => f.StackType);
        var agg = fullsByType[typeof(Agg)];
        var order = cb.CreateDeployOrder(agg);
        
        Assert.Equal(4, order.Count);
    }
    
    
    [Fact]
    public void OnlyBuildOnce()
    {
        var partials = RepetitiveBuilder().GetPartialRegistrations();
        var fulls = StackGraph.PartialToFullRegistrations(partials);
        var cb = new StackGraph(partials);
        
        var fullsByType = fulls.ToDictionary(f => f.StackType);
        var agg = fullsByType[typeof(Dev2Agg)];
        var order = cb.CreateDeployOrder(agg);
        
        Assert.Equal(5, order.Count);
    }
}