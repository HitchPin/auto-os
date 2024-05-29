using System.Text;
using System.Text.Json;

namespace Aos.DataModel;

public record ClusterSpec
{
    public const string ConfigKey = "hp-clusterspec";
    public string ClusterName { get; init; }
    public string ClusterId { get; init; }
    public string Region { get; init; }
    public NetworkingSpec Networking { get; init; }
    public SnapshotsSpec Snapshots { get; init; }
    public Customizations Customizations { get; init; }
    public LoggingSpec Logging { get; init; }
    public CapacitySpec Capacity { get; init; }
    public VersionsSpec Versions { get; init; }
    public TopologySpec Topology { get; init; }

    public string ToJson() => JsonSerializer.Serialize(this);
    public string ToConfigString() => Convert.ToBase64String(Encoding.UTF8.GetBytes(ToJson()));
    public static ClusterSpec FromJson(string json) => JsonSerializer.Deserialize<ClusterSpec>(json)!;

    public static ClusterSpec FromConfigString(string str) =>
        FromJson(Encoding.UTF8.GetString(Convert.FromBase64String(str)));
}