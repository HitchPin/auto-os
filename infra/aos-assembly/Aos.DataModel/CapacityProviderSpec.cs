using System.Text.Json.Serialization;

namespace Aos.DataModel;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "__capacityType")]
[JsonDerivedType(typeof(EC2AutoScalingCapacityProvider), typeDiscriminator: "EC2_ASG")]
[JsonDerivedType(typeof(FargateCapacityProvider), typeDiscriminator: "FARGATE")]
public abstract record CapacityProviderSpec
{
    public string Name { get; init; }
    public List<string>? CustomSecurityGroupIds { get; init; } 
    public List<string> SubnetIds { get; init; } 
    public int MaxCount { get; init; }
    public int MinCount { get; init; }


    public static EC2AutoScalingCapacityProvider EC2(string name) =>
        new EC2AutoScalingCapacityProvider() { Name = name };
    public record EC2AutoScalingCapacityProvider : CapacityProviderSpec
    {
        public string InstanceType { get; init; }
    }
    
    
    public static FargateCapacityProvider Fargate(string name) => new FargateCapacityProvider() { Name =name};
    public record FargateCapacityProvider : CapacityProviderSpec
    {
        public int vCPUs { get; init; }
        public int MemoryMB { get; init; }
        public CPUArchitecture Architecture { get; init; }
    }
}