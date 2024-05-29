namespace Summer.IAM.Policies;

public record PolicyDocument : BasePolicyDocument<PolicyStatement>
{
    public PolicyDocument WithStatement(PolicyStatement stmt)
    {
        return this with
        {
            Statements = Statements.Add(stmt)
        };
    }
}