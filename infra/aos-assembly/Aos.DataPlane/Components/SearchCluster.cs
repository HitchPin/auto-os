using System.Collections.Generic;
using Aos.DataModel;
using Aos.DataPlane.Components.Cluster;
using Pulumi;

namespace Aos.DataPlane.Components;

public class SearchCluster : ComponentResource
{
    private readonly Dictionary<NodeSpec, NodeAsg> nodeAsgs = new Dictionary<NodeSpec, NodeAsg>();
    public SearchCluster(SearchClusterParams pars, ComponentResourceOptions opts, string name)
        : base("autoos:DataPlane:SearchCluster", name, opts)
    {
        var spec = pars.Spec;
        this.Logging = new ClusterLogging(spec, new ComponentResourceOptions() { Parent = this }, "Logging");
        this.Snapshots = new ClusterSnapshots(spec, new ComponentResourceOptions() { Parent = this }, "Snapshots");

    }
    
    public ClusterLogging Logging { get; set; }
    public ClusterSnapshots Snapshots { get; set; }

    public static string Name => "DataPlane";
}