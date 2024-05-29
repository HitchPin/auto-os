using Aos.Rich.Serialization;
using Pulumi;
using Pulumi.AwsNative;

namespace Aos.Rich.Identity.Principals;

public class AccountPrincipal : IPrincipal
{
    public AccountPrincipal(string accountId)
    {
        this.AccountId = Output<string>.Create(Task.FromResult(accountId));
        this.AssumeRoleAction = StarrableArray.Of("sts:AssumeRole");
        this.PrincipalJson = CreatePrincipalJson(AccountId);
    }

    public Output<string> AccountId { get; }
    public Output<StarrableArray> AssumeRoleAction { get; }
    public Output<JsonPrincipal> PrincipalJson { get; }

    private static Output<JsonPrincipal> CreatePrincipalJson(Output<string> accountIdInput)
    {
        var partitionInput = GetPartition.Invoke().Apply(result => result.Partition);
        
        return Output.All(partitionInput, accountIdInput).Apply(results =>
        {
            var partition = results[0];
            var accountId = results[1];
            return JsonPrincipal.OfAWS($"arn:{partition}:iam::${accountId}:root");
        });
    }
}