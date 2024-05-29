using System.Threading.Tasks;
using Pulumi;
using Summer.IAM.Serialization;
using Summer.Environment;
using Summer.Environment.KnownTokens;

namespace Summer.IAM.Principals;

public record AccountPrincipal : PrincipalBase
{
    public AccountPrincipal(string accountId)
    {
        this.AccountId = Output<string>.Create(Task.FromResult(accountId));
        this.AssumeRoleAction = StarrableArray.Of("sts:AssumeRole");
        this.PrincipalJson = CreatePrincipalJson(AccountId);
    }

    public Output<string> AccountId { get; }

    private static Output<JsonPrincipal> CreatePrincipalJson(Output<string> accountIdInput)
    {
        var partition = Summertime.ResolveFromEnvironment(AWS.Partition);
        return Output.All(partition, accountIdInput).Apply(results =>
        {
            var partition = results[0];
            var accountId = results[1];
            return JsonPrincipal.OfAWS($"arn:{partition}:iam::{accountId}:root");
        });
    }
}