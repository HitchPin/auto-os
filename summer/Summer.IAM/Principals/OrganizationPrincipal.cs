using Pulumi;
using Summer.IAM.Serialization;

namespace Summer.IAM.Principals;

public record OrganizationPrincipal : PrincipalBase
{
    public OrganizationPrincipal(Input<string> orgId)
    {
        this.PrincipalJson = (Input<JsonPrincipal>)JsonPrincipal.AllPrincipals();
        this.AssumeRoleAction = StarrableArray.Of("sts:AssumeRole");
        this.Conditions = CreateConditions(orgId);
    }

    private Output<Conditions> CreateConditions(Output<string> orgId)
    {
        return Output.All(orgId).Apply(oid =>
            new Conditions()
                .WithOperator(ConditionOperator.Create("StringEquals"), new ConditionProperties()
                .WithProperty("aws:PrincipalOrgID", oid)));
    }
}