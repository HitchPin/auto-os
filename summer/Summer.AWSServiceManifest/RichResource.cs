using System.Collections.Generic;

namespace Summer.AWSServiceManifest;

public class RichResource
{
    public string Name { get; set; }
    public string Url { get; set; }
    public string Arn { get; set; }
    public List<ConditionInfo> RelevantConditions { get; set; }
    public Dictionary<AccessLevel, List<ActionInfo>> Actions { get; set; }
}