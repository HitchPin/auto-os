using System.Text;
using System.Text.Json;

namespace Aos.Rich.Policies;

public class PolicyDocument
{
    public string? Version { get; set; }
    public List<PolicyStatement> Statements { get; set; }
    
    
    public string ToJson()
    {
        using var ms = new MemoryStream();
        var writer = new Utf8JsonWriter(ms);
        writer.WriteStartObject();
        var version = Version ?? "2012-10-17";
        writer.WriteString("Version", version);
        if (Statements != null && Statements.Count > 0)
        {
            writer.WritePropertyName("Statements");
            writer.WriteStartArray();
            foreach (var stmt in Statements)
            {
                stmt.WriteJson(writer);
            }
            writer.WriteEndArray();
        }
        writer.WriteEndObject();
        writer.Flush();
        var bin = ms.ToArray();
        var str = Encoding.UTF8.GetString(bin);
        return str;
    }
}