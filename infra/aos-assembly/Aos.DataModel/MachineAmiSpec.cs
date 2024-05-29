using System.Collections.Immutable;
using System.Text.Json.Serialization;

namespace Aos.DataModel;

[JsonConverter(typeof(MachineAmiSpecJsonConverter))]
public record MachineAmiSpec
{
    private IImmutableDictionary<string, DualArchAmi> amis { get; init; }

    public MachineAmiSpec()
    {
        amis = ImmutableDictionary.Create<string, DualArchAmi>();
    }
    public MachineAmiSpec(IImmutableDictionary<string, DualArchAmi> amis)
    {
        this.amis = amis;
    }

    public MachineAmiSpec WithRegionAmi(string region, string x86_64, string arm64)
    {
        return this with
        {
            amis = amis.Add(region, new DualArchAmi(x86_64, arm64))
        };
    }

    public string GetArm64Ami(string region)
    {
        return amis[region].ARM_64;
    }
    public string GetX8664Ami(string region)
    {
        return amis[region].X86_64;
    }
    
    public record DualArchAmi(string X86_64, string ARM_64);
}