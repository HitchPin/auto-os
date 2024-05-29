using System.Collections.Immutable;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Aos.DataModel;

public class MachineAmiSpecJsonConverter : JsonConverter<MachineAmiSpec>
{
    public override MachineAmiSpec? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var converter =
            (JsonConverter<Dictionary<string, MachineAmiSpec.DualArchAmi>>)options.GetConverter(
                typeof(Dictionary<string, MachineAmiSpec.DualArchAmi>));
        var amis = converter.Read(ref reader, typeToConvert, options);
        return new MachineAmiSpec(amis.ToImmutableDictionary());
    }

    public override void Write(Utf8JsonWriter writer, MachineAmiSpec value, JsonSerializerOptions options)
    {
        var amiField = value.GetType().GetField("amis", BindingFlags.Instance | BindingFlags.NonPublic)!;
        var amis = (IImmutableDictionary<string, MachineAmiSpec.DualArchAmi>)amiField.GetValue(value)!;
        ((JsonConverter<IImmutableDictionary<string, MachineAmiSpec.DualArchAmi>>)options.GetConverter(amis.GetType()))
            .Write(writer, amis, options);
    }
}