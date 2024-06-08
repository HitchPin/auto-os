using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Pulumi;
using Summer.Environment;
using Summer.Environment.KnownTokens;

namespace Summer.Testing;

public class TestEnvProvider : IEnvProvider
{
    private static readonly string[] awsKeys = new[]
    {
        AWS.PartitionKey,
        AWS.RegionKey,
        AWS.ParitionDnsSuffixKey,
    };

    public string[] Keys => awsKeys;
    public ILogger<T> CreateLogger<T>() => new NullLogger<T>();

    public async Task<T> ResolveTokenAsync<T>(Token<T> asdf) => asdf.key switch
    {
        AWS.PartitionKey => (T)(object)Partition,
        AWS.RegionKey => (T)(object)Region,
        AWS.ParitionDnsSuffixKey => (T)(object)DnsSuffix,
        _ => throw new ArgumentException("Unsupported key for environment")
    };

    public Output<T> ResolveToken<T>(Token<T> asdf) => Output.Create(ResolveTokenAsync(asdf));

    public string Partition { get; set; } = "aws";
    public string Region { get; set; } = "us-west-2";
    public string DnsSuffix { get; set; } = "aws";
}