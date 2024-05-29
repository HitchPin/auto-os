namespace Aos.DataModel;

public record NetworkingSpec
{
    public string VpcId { get; init; }
    public string InternalClusterDomainName { get; init; }
    public List<string> SubnetIds { get; init; }
    public List<string> SecurityGroupIds { get; init; }
}