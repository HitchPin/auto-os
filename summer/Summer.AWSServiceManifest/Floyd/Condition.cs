using System.Collections.Generic;

namespace Summer.AWSServiceManifest.Floyd;

public class Condition
{
    public string Key { get; set; }
    public string Description { get; set; }
    public string Type { get; set; }
    public string Url { get; set; }
    public bool IsGlobal { get; set; }
    public List<string> RelatedActions { get; set; }
    public List<string> RelatedResourceTypes { get; set; }
}