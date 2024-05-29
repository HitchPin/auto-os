using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using Aos.DataModel;
using Pulumi;
using Pulumi.AwsNative.Logs;
using LogStream = Aos.DataModel.LogStream;

namespace Aos.DataPlane.Components.Cluster;

public class ClusterLogging : ComponentResource
{
    public IImmutableList<LogGroup> CreatedGroups { get; }
    public ClusterLogging(ClusterSpec spec, ComponentResourceOptions opts, string name)
        : base("autoos:DataPlane:ClusterLogging", name, opts)
    {
        var pars = spec.Logging;
        var prefix = $"{spec.ClusterName}{spec.ClusterId}-";
        var grps = new Dictionary<string, LogGroup>();
        foreach (var logStream in Enum.GetValues<LogStream>())
        {
            var lsName = pars.NameForStream(logStream);
            if (lsName == null) continue;
            var fName = prefix + lsName;

            if (grps.ContainsKey(fName)) continue;
            grps.Add(fName, new LogGroup(fName, new LogGroupArgs()
            {
                LogGroupName = fName,
                RetentionInDays = 30,
            }, new CustomResourceOptions() { Parent = this }));
        }

        this.CreatedGroups = grps.Values.ToImmutableArray();
    }
}