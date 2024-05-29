using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Summer.AWSServiceManifest.Floyd;

public class AWSDocsClient : IDisposable
{
    private readonly HttpClient client;

    public AWSDocsClient()
    {
        this.client = new HttpClient();
        this.client.DefaultRequestHeaders.AcceptLanguage.Add(new StringWithQualityHeaderValue("en-US", 0.9f));
        this.client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36");
    }
    
    public async Task<List<string>> LoadAwsServiceListAsync()
    {
        var url =
            "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_actions-resources-contextkeys.html";
        var regex = new Regex("href=\"\\.\\/list_(.*?)\\.html\"");
        var html = await client.GetStringAsync(new Uri(url));
        return regex.Matches(html).Select(m => m.Groups[1].Value).ToList();
    }

    public void Dispose()
    {
        this.client.Dispose();
        ;
    }
}