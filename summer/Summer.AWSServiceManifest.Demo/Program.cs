using System;
using Summer.AWSServiceManifest;
using Summer.AWSServiceManifest.Floyd;

var reader = new ManifestReader();
var svcs = await ManifestReader.ReadAsync("aws-registry.json");
foreach (var svc in svcs)
{
    var rts = svc.Value.ResourceTypes;
    if (rts != null && rts.Count > 0) ;
    var rt = new RichResource();
    
}
foreach (var svc in svcs)
{
    Console.WriteLine(svc);
}