using System.Collections.Generic;
using Pulumi;
using Summer.IAM.Serialization;

namespace Summer.IAM.Principals;

public interface IPrincipal
{
    public Output<Conditions> Conditions { get; }
    public Output<StarrableArray> AssumeRoleAction { get; }
    public Output<JsonPrincipal> PrincipalJson { get; }
    public IPrincipal WithCondition(ConditionOperator conditionOperator, ConditionProperties props);

    public static IPrincipal operator +(IPrincipal p1, IPrincipal p2)
    {
        var principals = new List<IPrincipal>();
        if (p1 is WildcardPrincipal || p2 is WildcardPrincipal) return new WildcardPrincipal();
        if (p1 is CompositePrincipal c1)
        {
            principals.AddRange(c1.Principals);
        }
        else
        {
            principals.Add(p1);
        }

        if (p2 is CompositePrincipal c2)
        {
            principals.AddRange(c2.Principals);
        }
        else
        {
            principals.Add(p2);
        }

        return new CompositePrincipal(principals);
    }
}