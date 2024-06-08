using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Microsoft.Extensions.DependencyInjection;
using Summer.Core.Graph;

namespace Summer.Core;

public class AppBuilder<TAppId> where TAppId : class, IAppIdentifier
{
    private readonly List<PartialStackRegistration> registeredStacks = new List<PartialStackRegistration>();
    private readonly IServiceCollection svc = new ServiceCollection();

    public AppBuilder<TAppId> RegisterStack<T>() where T : Season<TAppId>
    {
        var stackName = StackNameHelper.InferBestNameForStack<T>();
        svc.AddSingleton<T>();
        svc.AddSingleton<IServiceCollection>(svc);
        registeredStacks.Add(new PartialStackRegistration(stackName, typeof(T), new List<Type>()));
        return this;
    }
    
    public AppBuilder<TAppId> RegisterStack<T>(Expression<Func<IServiceProvider, T>> factory) where T : Season<TAppId>
    {
        var stackName = StackNameHelper.InferBestNameForStack<T>();
        var implFactory = factory.Compile();
        svc.AddSingleton<T>(implFactory);
        var descriptor = svc.ToList().First(
            s => s.ServiceType == typeof(T));
        var deps = Dependencies.IdentifyStackDependencies(factory, descriptor);
        registeredStacks.Add(new PartialStackRegistration(stackName, typeof(T), deps));
        return this;
    }

    public App<TAppId> Build(TAppId id)
    {
        var graph = new StackGraph(this.registeredStacks);
        svc.AddSingleton<TAppId>();
        return new App<TAppId>(id, graph, svc.BuildServiceProvider());
    }

}