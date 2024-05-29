using System.Collections.Generic;

namespace Summer.AWSServiceManifest.Floyd;

public record ResourceTypeOnAction(bool Required, List<string> Conditions);