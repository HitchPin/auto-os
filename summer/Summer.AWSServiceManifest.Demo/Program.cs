using System;
using Summer.AWSServiceManifest;
using Summer.AWSServiceManifest.Floyd;

var docs = new AWSDocsClient();
var svcs = await docs.LoadAwsServiceListAsync();

foreach (var svc in svcs)
{
    Console.WriteLine(svc);
}