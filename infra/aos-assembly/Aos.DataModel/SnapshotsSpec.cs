namespace Aos.DataModel;

public record SnapshotsSpec
{
    public string BucketName { get; init; }
    public string Prefix { get; init; }
    public string Schedule { get; init; }
}