using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Pulumi;
using Pulumi.AwsNative;

namespace Summer.Environment.PulumiAws;

public class PulumiAwsEnvProvider : IEnvProvider
{
    private static readonly string[] awsKeys = new[]
    {
        KnownTokens.AWS.PartitionKey,
        KnownTokens.AWS.RegionKey,
        KnownTokens.AWS.ParitionDnsSuffixKey,
    };

    public string[] Keys => awsKeys;

    public async Task<T> ResolveTokenAsync<T>(Token<T> asdf) => asdf.key switch
    {
        KnownTokens.AWS.PartitionKey => (T)(object)(await GetPartition.InvokeAsync()).Partition,
        KnownTokens.AWS.RegionKey => (T)(object)(await GetRegion.InvokeAsync()).Region,
        KnownTokens.AWS.ParitionDnsSuffixKey => (T)(object)(await GetPartition.InvokeAsync()).DnsSuffix,
        KnownTokens.AWS.AccountIdKey => (T)(object)(await GetAccountId.InvokeAsync()).AccountId,
        _ => throw new ArgumentException("Unsupported key for environment")
    };

    public Output<T> ResolveToken<T>(Token<T> asdf) => Output.Create(ResolveTokenAsync(asdf));

}