using System.Text.Json;
using Newtonsoft.Json.Linq;
using Summer.IAM.Principals;
using Summer.Testing;

namespace Summer.IAM.Tests.Principals;

public class FederatedPrincipalTest
{
    [Fact]
    public async Task PlugsUserIdIntoCorrectField()
    {
        var canonP = new FederatedPrincipal("1-234-5678");
        var j = await canonP.PrincipalJson.AsTask();
        var jj = JObject.Parse(JsonSerializer.Serialize(j));
        Assert.Equal("1-234-5678", jj["Federated"][0]);
        
    }
}