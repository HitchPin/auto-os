using Pulumi;
using Summer.IAM.Serialization;

namespace Summer.IAM.Principals;

public record CanonicalUserPrincipal : PrincipalBase
{
    public CanonicalUserPrincipal(Input<string> canonUpn)
    {
        this.PrincipalJson = CreateJsonPrincipal(canonUpn);
        this.AssumeRoleAction = StarrableArray.Of("sts:AssumeRole");
        this.Conditions = Output.Create(new Conditions());
    }

    private Output<JsonPrincipal> CreateJsonPrincipal(Input<string> cannonUpn)
    {
        return Output.All(cannonUpn).Apply(canon =>
        {
            var id = canon[0];
            return (Input<JsonPrincipal>)JsonPrincipal.OfCanonicalUser(id);
        });
    }
}