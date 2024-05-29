using Pulumi;
using Summer.IAM.Serialization;

namespace Summer.IAM.Principals;

public abstract record PrincipalBase : IPrincipal
{
    public Output<Conditions> Conditions { get; protected set; }
    public Output<StarrableArray> AssumeRoleAction { get; protected set; }
    public Output<JsonPrincipal> PrincipalJson { get;protected set; }

    public IPrincipal WithCondition(ConditionOperator op, ConditionProperties props)
    {
        return this with
        {
            Conditions = Conditions.Apply(c => c.WithOperator(op, props))
        };
    }
    public IPrincipal WithConditions(Conditions conditions)
    {
        return this with
        {
            Conditions = (Input<Conditions>)conditions
        };
    }
}