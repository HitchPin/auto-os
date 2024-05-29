namespace Summer.IAM.Policies;

public record TrustPolicyDocument : BasePolicyDocument<TrustPolicyStatement>
{
    public TrustPolicyDocument WithStatement(TrustPolicyStatement stmt)
    {
        return this with
        {
            Statements = Statements.Add(stmt)
        };
    }
}