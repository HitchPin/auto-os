using System;
using Summer.IAM.Principals;

namespace Summer.IAM.Policies;

public record TrustPolicyStatement : PolicyStatement
{
    public IPrincipal? Principals { get; private init; }
    public IPrincipal? NotPrincipals { get; private init; }
    
    #region "Principals / NotPrincipals"
    
    public PolicyStatement WithPrincipal(IPrincipal principal) => WithExactPrincipals(Principals == null ? principal : Principals + principal);
    public PolicyStatement WithAllPrincipals() => WithExactPrincipals(new WildcardPrincipal());
    public PolicyStatement ReplacePrincipal(IPrincipal principal) => WithExactPrincipals(principal);
    
    public PolicyStatement WithNotPrincipal(IPrincipal notPrincipal) => WithExactNotPrincipals(NotPrincipals == null ? notPrincipal : NotPrincipals + notPrincipal);
    public PolicyStatement WithNoPrincipals() => WithExactNotPrincipals(new WildcardPrincipal());
    public PolicyStatement ReplaceNotPrincipal(IPrincipal notPrincipal) => WithExactNotPrincipals(notPrincipal);

    private PolicyStatement WithExactPrincipals(IPrincipal p)
    {
        if (NotPrincipals != default)
        {
            throw new ArgumentException("You cannot set both Principals and NotPrincipals in the same policy statement.");
        }

        var withP = this with
        {
            Principals = p
        };
        return withP.WithAction("sts:AssumeRole");
    }
    private PolicyStatement WithExactNotPrincipals(IPrincipal p)
    {
        if (Principals != default)
        {
            throw new ArgumentException("You cannot set both Principals and NotPrincipals in the same policy statement.");
        }

        return this with
        {
            NotPrincipals = p
        };
    }
    #endregion

}