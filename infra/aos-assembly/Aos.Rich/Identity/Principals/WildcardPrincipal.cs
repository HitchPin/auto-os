using Aos.Rich.Serialization;
using Pulumi;

namespace Aos.Rich.Identity.Principals;

public class WildcardPrincipal : IPrincipal
{
    private static readonly Output<JsonPrincipal> AllPrincipalsJson = Output.Create(JsonPrincipal.AllPrincipals());
    private static readonly Output<StarrableArray> StsAssumeRole = Output.Create(StarrableArray.Of("sts:AssumeRole"));

    public WildcardPrincipal()
    {
        PrincipalJson = AllPrincipalsJson;
        AssumeRoleAction = StsAssumeRole;
    }
    
    public Output<JsonPrincipal> PrincipalJson { get; }
    public Output<StarrableArray> AssumeRoleAction { get; }
}