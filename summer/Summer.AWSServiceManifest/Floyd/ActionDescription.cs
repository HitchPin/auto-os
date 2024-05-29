using System.Collections.Generic;

namespace Summer.AWSServiceManifest.Floyd;

public class ActionDescription
{
    public string Url { get; set; }
    public string Description { get; set; }
    public string AccessLevel { get; set; }
    
    public Dictionary<string, ResourceTypeOnAction> ResourceTypes { get; set; }
    public List<string> Conditions { get; set; }
    public List<string> DependentActions { get; set; }
}