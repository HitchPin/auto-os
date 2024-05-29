namespace Aos.DataModel;

public record NodeSpec
{
    public string CapacityProviderName { get; init; }
    public int MinCount { get; init; }
    public int MaxCount { get; init; }
    public NodeRole Role { get; init; }
    public string Name { get; init; }
    public bool EnabledBehindLoadBalancer { get; init; }
}