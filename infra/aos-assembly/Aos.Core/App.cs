using System;
using System.Collections.Generic;
using Aos.Core.Graph;

namespace Aos.Core;

public class App
{
    private readonly StackGraph graph;
    private readonly IServiceProvider svc;

    public App(StackGraph graph, IServiceProvider svc)
    {
        this.graph = graph;
        this.svc = svc;
    }

    public List<string> Stacks => graph.Stacks;
    public StackGraph Graph => graph;
    public IServiceProvider Svc => svc;

}