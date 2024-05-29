using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using Summer.IAM.Principals;

namespace Summer.IAM.Serialization;

public class ConditionPropertiesJsonConverter : JsonConverter<ConditionProperties>
{
    public override ConditionProperties? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.StartObject)
        {
            throw new ArgumentException("Expecting start object.");
        }

        reader.Read();
        ConditionProperties p = new ConditionProperties();
        while (reader.TokenType != JsonTokenType.EndObject)
        {
            string propName = reader.GetString();
            reader.Read();
            if (reader.TokenType == JsonTokenType.String)
            {
                p = p.WithProperty(propName, reader.GetString()!);
            }
            else if (reader.TokenType == JsonTokenType.StartArray)
            {
                reader.Read();
                var vals = new List<string>();
                while (reader.TokenType != JsonTokenType.EndArray)
                {
                    vals.Add(reader.GetString()!);
                    reader.Read();
                }
                p = p.WithProperty(propName, vals);
            }
            else
            {
                throw new ArgumentException("Expected [ or \".");
            }

            reader.Read();
        }

        return p;
    }

    public override void Write(Utf8JsonWriter writer, ConditionProperties value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        foreach (var k in value.Keys)
        {
            writer.WritePropertyName(k);

            var vals = value[k];
            if (vals.Count == 1)
            {
                writer.WriteStringValue(vals[0]);
            }
            else
            {
                writer.WriteStartArray();
                foreach (var v in vals)
                {
                    writer.WriteStringValue(v);
                }
                writer.WriteEndArray();
            }
        }
        writer.WriteEndObject();
    }
}