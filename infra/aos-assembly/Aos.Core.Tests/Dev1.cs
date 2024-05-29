using System.Collections.Generic;
using Pulumi;
using Pulumi.AwsNative.S3;

namespace Aos.Core.Tests;

public class Dev1 : Stack
{
    public Dev1()
    {
        // Create an AWS resource (S3 Bucket)
        var bucket = new Bucket("hp-pulumi-graph-bucket");

        this.BucketName = bucket.BucketName!;
    }
    
    [Output]
    public Input<string> BucketName { get; set; }
}