using Pulumi;
using Summer.IAM.Serialization;

namespace Summer.IAM.Principals;

public record WildcardPrincipal : PrincipalBase, IPrincipal
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