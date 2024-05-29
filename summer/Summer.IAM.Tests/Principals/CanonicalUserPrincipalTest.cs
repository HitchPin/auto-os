using System.Text.Json;
using Newtonsoft.Json.Linq;
using Summer.IAM.Principals;
using Summer.Testing;

namespace Summer.IAM.Tests.Principals;

public class CanonicalUserPrincipalTest
{
    [Fact]
    public async Task PlugsUserIdIntoCorrectField()
    {
        var canonP = new CanonicalUserPrincipal("abcd1234");
        var j = await canonP.PrincipalJson.AsTask();
        var jj = JObject.Parse(JsonSerializer.Serialize(j));
        Assert.Equal("abcd1234", jj["CanonicalUser"][0]);
        
    }
}