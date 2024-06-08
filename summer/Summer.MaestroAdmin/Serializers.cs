using System.Text.Json;
using System.Text.Json.Serialization;

namespace Summer.MaestroAdmin;

internal static class Serializers
{
    private static readonly JsonSerializerOptions SerializerOptions = new JsonSerializerOptions()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        Converters =
        {
            new JsonStringEnumConverter()
        }
    };
    
    internal static string Serialize<T>(T input)
    {
        return JsonSerializer.Serialize(input, SerializerOptions);
    }
    internal static string SerializeWithSpacing<T>(T input)
    {
        return JsonSerializer.Serialize(input, new JsonSerializerOptions(SerializerOptions)
        {
            WriteIndented = true
        });
    }
    internal static T Deserialize<T>(string json)
    {
        return JsonSerializer.Deserialize<T>(json, SerializerOptions)!;
    }
}