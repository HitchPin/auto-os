using System.Text.Json.Serialization;

namespace Aos.DataModel;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "__nodeRoleType")]
[JsonDerivedType(typeof(Bootstrapper), typeDiscriminator: "bootstrapper")]
[JsonDerivedType(typeof(DedicatedManager), typeDiscriminator: "dedicated_manager")]
[JsonDerivedType(typeof(DedicatedCoordinator), typeDiscriminator: "dedicated_coordinator")]
[JsonDerivedType(typeof(CapableGeneralist), typeDiscriminator: "capable_generalist")]
public abstract record NodeRole
{
    public static NodeRole NewBootstrapper() => new Bootstrapper();
    public static NodeRole NewDedicatedManager() => new DedicatedManager();
    public static NodeRole NewDedicatedCoordinator() => new DedicatedCoordinator();

    public static NodeRole NewWithCapabilities(params NodeCapability[] cs) =>
        new CapableGeneralist() { Capabilities = cs.ToList() };
    
    public record Bootstrapper : NodeRole;

    public record DedicatedManager : NodeRole;

    public record DedicatedCoordinator : NodeRole;

    public record CapableGeneralist : NodeRole
    {
        public List<NodeCapability> Capabilities { get; init; }
    }
}