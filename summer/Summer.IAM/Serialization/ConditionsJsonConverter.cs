using System;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using Summer.IAM.Principals;

namespace Summer.IAM.Serialization;

public class ConditionsJsonConverter : JsonConverter<Conditions>
{
    public override Conditions? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var converter = (JsonConverter<ConditionProperties>)options.GetConverter(typeof(ConditionProperties));
        if (reader.TokenType != JsonTokenType.StartObject)
        {
            throw new ArgumentException("Expecting {");
        }

        reader.Read();

        var cs = new Conditions();
        while (reader.TokenType != JsonTokenType.EndObject)
        {
            string prop = reader.GetString()!;
            reader.Read();
            var v = converter.Read(ref reader, typeof(ConditionProperties), options);
            cs = cs.WithOperator(ConditionOperator.Create(prop), v);
        }

        return cs;
    }

    public override void Write(Utf8JsonWriter writer, Conditions value, JsonSerializerOptions options)
    {
        var converter = (JsonConverter<ConditionProperties>)options.GetConverter(typeof(ConditionProperties));
        writer.WriteStartObject();
        foreach (var k in value.OperatorKeys)
        {
            var v = value[k];
            if (v == null || v.Keys.Count() == 0) continue;
            writer.WritePropertyName(k);
            converter.Write(writer, v, options);
        }
        writer.WriteEndObject();
    }
}