using Pulumi;
using Pulumi.AwsNative.S3;
using System.Collections.Generic;
using Aos.Core;
using Aos.Substrate;

var app = new AppBuilder()
    .RegisterStack<SubstrateStack>()
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

