using Pulumi;
using System.Collections.Generic;
using Pulumi.AwsNative.Iam;
using Summer.IAM.Policies;
using Summer.IAM.Principals;

return await Deployment.RunAsync(() =>
{
    var trustDoc = new TrustPolicyDocument()
        .WithStatement(
            new TrustPolicyStatement()
                .WithPrincipal(new ServicePrincipal("lambda.amazonaws.com"))
                .WithResource("*"));
    
    var r = new Role("asdf", new RoleArgs()
    {
        AssumeRolePolicyDocument =.ToJson(),
        ManagedPolicyArns = new InputList<string>()
        {
            "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        }
    });
    // Export the name of the bucket
    return new Dictionary<string, object?>
    {
        ["roleArn"] = r.Arn
    };
});
