using Pulumi;
using Summer.Security;

namespace Summer.FactSpec;

public record FactSpecificationArgs
{
    public bool IsSecret { get; init; }
    public string Name { get; init; }
    public string? Description { get; init; }
    public EncryptionKey EncryptionKey { get; init; }
    public Output<string> Value { get; init; }
}