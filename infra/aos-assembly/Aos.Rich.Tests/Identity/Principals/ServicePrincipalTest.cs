using System.Text.Json;
using Aos.Rich.Identity.Principals;
using Newtonsoft.Json.Linq;

namespace Aos.Rich.Tests.Identity.Principals;

public class ServicePrincipalTest
{
    [Fact]
    public void ServicePrincipalJsonRendersCorrectly()
    {
        var sp = new ServicePrincipal("lambda.amazonaws.com");
        var obj = JObject.Parse(JsonSerializer.Serialize(sp.PrincipalJson));
        Assert.Equal("lambda.amazonaws.com", obj["Service"]);
        Assert.NotNull(obj);
    }
}