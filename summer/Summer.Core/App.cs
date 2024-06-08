using System;
using System.Collections.Generic;
using Summer.Core.Graph;

namespace Summer.Core;

public class App<TAppId> where TAppId : IAppIdentifier
{
    private readonly StackGraph graph;
    private readonly IServiceProvider svc;
    private readonly TAppId id;
    public App(TAppId id, StackGraph graph, IServiceProvider svc)
    {
        this.id = id;
        this.graph = graph;
        this.svc = svc;
    }

    public TAppId Id => id;
    public List<string> Stacks => graph.Stacks;
    public StackGraph Graph => graph;
    public IServiceProvider Svc => svc;
}