using System.Collections.Generic;

namespace Summer.AWSServiceManifest.Floyd;

public class ServiceDescription
{
    public string Name { get; set; }
    public string ServicePrefix { get; set; }
    public string FileName { get; set; }
    public string URL { get; set; }
    public List<ActionDescription> ActionList { get; set; }
    public Dictionary<string, ResourceType> ResourceTypes { get; set; }
    public Dictionary<string, object> Fixes { get; set; }
    public Dictionary<string, Condition> Conditions { get; set; }
    //public 
        
    //resourceTypes?: ResourceTypes;
    //fixes?: Record<string, any>;
    //conditions?: Conditions;
}