using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Aos.Core.Graph;
using Aos.PlanarFoundation;
using Microsoft.Extensions.DependencyInjection;
using Pulumi;

namespace Aos.Core;

public class AppBuilder
{
    private readonly List<PartialStackRegistration> registeredStacks = new List<PartialStackRegistration>();
    private readonly IServiceCollection svc = new ServiceCollection();

    public AppBuilder RegisterStack<T>(string stackName) where T : Stack, new()
    {
        svc.AddSingleton<T>();
        registeredStacks.Add(new PartialStackRegistration(stackName, typeof(T), new List<Type>()));
        return this;
    }
    public AppBuilder RegisterStack<T>() where T : PlanarStack, IPlanarStack, new()
    {
        svc.AddSingleton<T>();
        registeredStacks.Add(new PartialStackRegistration(T.Name, typeof(T), new List<Type>()));
        return this;
    }
    
    public AppBuilder RegisterStack<T>(string stackName, Expression<Func<IServiceProvider, T>> factory) where T : Stack
    {
        var implFactory = factory.Compile();
        svc.AddSingleton<T>(implFactory);
        var descriptor = svc.ToList().First(
            s => s.ServiceType == typeof(T));
        var deps = Dependencies.IdentifyStackDependencies(factory, descriptor);
        registeredStacks.Add(new PartialStackRegistration(stackName, typeof(T), deps));
        return this;
    }
    public AppBuilder RegisterStack<T>(Expression<Func<IServiceProvider, T>> factory) where T : PlanarStack, IPlanarStack
    {
        var implFactory = factory.Compile();
        svc.AddSingleton<T>(implFactory);
        var descriptor = svc.ToList().First(
            s => s.ServiceType == typeof(T));
        var deps = Dependencies.IdentifyStackDependencies(factory, descriptor);
        registeredStacks.Add(new PartialStackRegistration(T.Name, typeof(T), deps));
        return this;
    }

    public App Build()
    {
        var graph = new StackGraph(this.registeredStacks);
        return new App(graph, svc.BuildServiceProvider());
    }

}