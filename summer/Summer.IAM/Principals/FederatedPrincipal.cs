using Pulumi;
using Summer.IAM.Serialization;

namespace Summer.IAM.Principals;

public record FederatedPrincipal : PrincipalBase
{
    public FederatedPrincipal(Input<string> canonUpn)
    {
        this.PrincipalJson = CreateJsonPrincipal(canonUpn);
        this.AssumeRoleAction = StarrableArray.Of("sts:AssumeRole");
        this.Conditions = Output.Create(new Conditions());
    }
    
    private Output<JsonPrincipal> CreateJsonPrincipal(Input<string> fedId)
    {
        return Output.All(fedId).Apply(fid =>
        {
            var id = fid[0];
            return (Input<JsonPrincipal>)JsonPrincipal.OfFederated(id);
        });
    }
}