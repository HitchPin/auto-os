using Pulumi;

namespace Summer.Demo;

public class EncryptionKeyArgs : ResourceArgs
{
    public string Name { get; init; }
    public string? Description { get; init; }
}