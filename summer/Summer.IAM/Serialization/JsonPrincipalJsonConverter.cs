using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Summer.IAM.Serialization;

public class JsonPrincipalJsonConverter : JsonConverter<JsonPrincipal>
{
    public override JsonPrincipal? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var starArrConverter = (JsonConverter<StarrableArray>)options.GetConverter(typeof(StarrableArray));
        
        if (reader.TokenType == JsonTokenType.String)
        {
            string str = reader.GetString()!;
            if (str != "*")
            {
                throw new ArgumentException($"A string at the top level of a principal must be an asterisk.");
            }

            return JsonPrincipal.AllPrincipals();
        }

        if (reader.TokenType != JsonTokenType.StartObject)
        {
            throw new ArgumentException($"A principal must either be an asterisk or a JSON Principal object.");
        }

        reader.Read();

        var sp = JsonPrincipal.NoPrincipals();
        while (reader.TokenType != JsonTokenType.EndObject)
        {
            string propName = reader.GetString()!;
            reader.Read();
            if (reader.TokenType == JsonTokenType.Null)
            {
                reader.Read();
                continue;
            }
            var starArr = starArrConverter.Read(ref reader, typeof(StarrableArray), options);
            reader.Read();
            if (starArr == null)
            {
                continue;
            }
            switch (propName)
            {
                case JsonPrincipal.AWSKey:
                    sp = sp.WithAWS(starArr);
                    break;
                case JsonPrincipal.FederatedKey:
                    sp = sp.WithFederated(starArr);
                    break;
                case JsonPrincipal.ServiceKey:
                    sp = sp.WithService(starArr);
                    break;
                case JsonPrincipal.CanonicalUserKey:
                    sp = sp.WithCanonicalUser(starArr);
                    break;
                default:
                    throw new ArgumentException($"Unknown property key '{propName}' in JSON Principal.");
            }
        }

        return sp;
    }

    public override void Write(Utf8JsonWriter writer, JsonPrincipal value, JsonSerializerOptions options)
    {
        var starArrConverter = (JsonConverter<StarrableArray>)options.GetConverter(typeof(StarrableArray));
        if (value.IsStar)
        {
            writer.WriteStringValue("*");
            return;
        }
        writer.WriteStartObject();

        void WritePrincipalProp(string key, StarrableArray arr)
        {
            if (arr != StarrableArray.Empty)
            {
                writer.WritePropertyName(key);
                starArrConverter.Write(writer, arr, options);
            }
        }

        WritePrincipalProp(JsonPrincipal.AWSKey, value.AWS);
        WritePrincipalProp(JsonPrincipal.ServiceKey, value.Service);
        WritePrincipalProp(JsonPrincipal.FederatedKey, value.Federated);
        WritePrincipalProp(JsonPrincipal.CanonicalUserKey, value.CanonicalUser);
        
        writer.WriteEndObject();
    }
}