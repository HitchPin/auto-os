namespace Aos.DataModel;

public record TopologySpec
{
    public bool ZoneAwareness { get; init; }
    public List<NodeSpec> NodeSpecifications { get; init; }
}