using System.Text.Json;
using System.Text.Json.Nodes;
using Aos.Rich.Policies;
using Aos.Rich.Serialization;
using Pulumi;
using Pulumi.AwsNative;

namespace Aos.Rich.Identity.Principals;

public class ServicePrincipal : IPrincipal
{
    public ServicePrincipal()
    {
    }

    public ServicePrincipal(string servicePrincipal, bool exact = false)
    {
        if (exact)
        {
            ServicePrincipalName = Output<string>.Create(Task.FromResult(servicePrincipal));
        }
        else
        {
            ServicePrincipalName = GetRegion.Invoke().Apply(r =>
            {
                var ri = Amazon.CDK.RegionInfo.RegionInfo.Get(r.Region);
                return ri.ServicePrincipal(servicePrincipal);
            })!;
        }
        PrincipalJson = ServicePrincipalName.Apply(spn => JsonPrincipal.OfService(spn));
        AssumeRoleAction = StarrableArray.Of("sts:AssumeRole");
    }

    public Output<string> ServicePrincipalName { get; }

    public Output<JsonPrincipal> PrincipalJson { get; }
    public Output<StarrableArray> AssumeRoleAction { get; }


    public static readonly ServicePrincipal EC2 = new ServicePrincipal("ec2.amazonaws.com");
    public static readonly ServicePrincipal LAMBDA = new ServicePrincipal("lambda.amazonaws.com");
}