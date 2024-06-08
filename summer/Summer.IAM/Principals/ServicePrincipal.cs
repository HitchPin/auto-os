using System.Text.Json;
using System.Threading.Tasks;
using Pulumi;
using Summer.Environment;
using Summer.Environment.KnownTokens;
using Summer.IAM.Serialization;

namespace Summer.IAM.Principals;

public record ServicePrincipal : PrincipalBase, IPrincipal
{
    public ServicePrincipal(string servicePrincipal, string region)
    {
        PrincipalJson = Output<JsonPrincipal>.Create(Task.FromResult(JsonPrincipal.OfService(servicePrincipal)));
        AssumeRoleAction = StarrableArray.Of("sts:AssumeRole");
    }
    public ServicePrincipal(string servicePrincipal, bool exact = false)
    {
        if (exact)
        {
            ServicePrincipalName = Output<string>.Create(Task.FromResult(servicePrincipal));
        }
        else
        {
            var regionInfo = Summertime.ResolveFromEnvironment(AWS.Region);
            ServicePrincipalName = (Input<string>)servicePrincipal;
        }
        PrincipalJson = ServicePrincipalName.Apply(spn => JsonPrincipal.OfService(spn));
        AssumeRoleAction = StarrableArray.Of("sts:AssumeRole");
    }

    public Output<string> ServicePrincipalName { get; }



    public static readonly ServicePrincipal EC2 = new ServicePrincipal("ec2.amazonaws.com");
    public static readonly ServicePrincipal LAMBDA = new ServicePrincipal("lambda.amazonaws.com");
}