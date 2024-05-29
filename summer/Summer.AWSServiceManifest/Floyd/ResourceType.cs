using System.Collections.Generic;

namespace Summer.AWSServiceManifest.Floyd;

public record ResourceType
{
    public string Name { get; set; }
    public string Url { get; set; }
    public string Arn { get; set; }
    public List<string> ConditionKeys { get; set; }
}