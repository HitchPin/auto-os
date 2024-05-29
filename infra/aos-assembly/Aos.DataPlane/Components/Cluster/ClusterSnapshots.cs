using Aos.DataModel;
using Pulumi;
using Pulumi.AwsNative.S3;

namespace Aos.DataPlane.Components.Cluster;

public class ClusterSnapshots : ComponentResource
{
    public ClusterSnapshots(ClusterSpec spec, ComponentResourceOptions opts, string name)
        : base("autoos:DataPlane:ClusterSnapshots", name, opts)
    {
        var bucketName = spec.GetHyphenatedPrefix() + "-snapshots";
        var bucket = new Bucket("SnapshotBucket", new BucketArgs()
        {
            BucketName = bucketName.Replace("_", "-").ToLower()
        });

        this.SnapshotBucketName = bucket.BucketName;
    }
    
    
    [Output]
    public Output<string> SnapshotBucketName { get; set; }
}