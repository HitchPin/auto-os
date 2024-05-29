using System.Collections.Immutable;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using Pulumi;

namespace Summer.IAM.Policies;

public abstract record BasePolicyDocument<T> where T : PolicyStatement
{
    public string? Version { get; private init; } = "2012-10-17";
    public IImmutableList<T> Statements { get; protected init; } = ImmutableList.Create<T>();
    
    public Output<string> ToJson()
    {
        using var ms = new MemoryStream();
        var writer = new Utf8JsonWriter(ms);
        writer.WriteStartObject();
        var version = Version ?? "2012-10-17";
        writer.WriteString("Version", version);

        if (Statements == null || Statements.Count == 0)
        {
            writer.WriteEndObject();
            writer.Flush();
            var emptyBin = ms.ToArray();
            var emptyStr = Encoding.UTF8.GetString(emptyBin);
            return Output.Create(emptyStr);
        }

        return Output.All(Statements.Select(s => s.ToJson())).Apply(arr =>
        {
            writer.WritePropertyName("Statements");
            writer.WriteStartArray();
            foreach (var stmt in arr)
            {
                writer.WriteRawValue(stmt);
            }
            writer.WriteEndArray();
            writer.WriteEndObject();
            writer.Flush();
            var bin = ms.ToArray();
            var str = Encoding.UTF8.GetString(bin);
            return str;
        });
        
    }
}