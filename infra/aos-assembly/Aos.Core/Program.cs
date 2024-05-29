using Pulumi;
using Pulumi.AwsNative.S3;
using System.Collections.Generic;
using Aos.Core;
using Aos.ControlPlane;
using Aos.DataPlane;
using Aos.Substrate;
using Microsoft.Extensions.DependencyInjection;

var app = new AppBuilder()
    .RegisterStack<SubstrateStack>()
    .RegisterStack<ControlPlaneStack>(
        (s) => new ControlPlaneStack(s.GetRequiredService<SubstrateStack>()))
    .RegisterStack<DataPlaneStack>()
    .Build();

return await Deployment.RunAsync(() =>
{
    // Create an AWS resource (S3 Bucket)
    var bucket = new Bucket("my-bucket");

    // Export the name of the bucket
    return new Dictionary<string, object?>
    {
        ["bucketName"] = bucket.Id
    };
});

