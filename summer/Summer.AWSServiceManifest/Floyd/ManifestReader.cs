using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Summer.AWSServiceManifest.Floyd;

namespace Summer.AWSServiceManifest.Floyd;

public class ManifestReader
{
    private static readonly JsonSerializerOptions options = new JsonSerializerOptions()
    {
    };
    public static async Task<Dictionary<string, ServiceDescription>> ReadAsync(string file)
    {
        using var fs = File.OpenRead(file);
        var r = await JsonSerializer.DeserializeAsync<Dictionary<string, ServiceDescription>>(fs, options);
        return r;
    }
}