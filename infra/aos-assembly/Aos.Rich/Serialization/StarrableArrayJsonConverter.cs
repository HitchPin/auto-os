using System.Text.Json;
using System.Text.Json.Serialization;
using Aos.Rich.Policies;

namespace Aos.Rich.Serialization;

public class StarrableArrayJsonConverter : JsonConverter<StarrableArray>
{
    public override StarrableArray? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString()!;
            if (str != "*")
            {
                throw new Exception("Found string value that was not an asterisk.");
            }

            return StarrableArray.Star;
        }
        else if (reader.TokenType == JsonTokenType.StartArray)
        {
            var actions = new List<string>();
            reader.Read();
            while (reader.TokenType != JsonTokenType.EndArray)
            {
                if (reader.TokenType != JsonTokenType.String)
                {
                    throw new Exception("Found non-string value in starrable array.");
                }

                actions.Add(reader.GetString()!);
                reader.Read();
            }
            return StarrableArray.Of(actions);
        }
        else
        {
            throw new ArgumentException("Expected '*' or array of strings.");
        }
    }

    public override void Write(Utf8JsonWriter writer, StarrableArray value, JsonSerializerOptions options)
    {
        if (value.IsStar)
        {
            writer.WriteStringValue("*");
        }
        else
        {
            writer.WriteStartArray();
            foreach (var a in value.Items)
            {
                writer.WriteStringValue(a);
            }
            writer.WriteEndArray();
        }
    }
}