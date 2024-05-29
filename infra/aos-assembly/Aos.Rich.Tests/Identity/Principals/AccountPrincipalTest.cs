using System.Text.Json;
using Aos.Rich.Identity.Principals;
using Newtonsoft.Json.Linq;

namespace Aos.Rich.Tests.Identity.Principals;

public class AccountPrincipalTest
{
    [Fact]
    public void ServicePrincipalJsonRendersCorrectly()
    {
        var ap = new AccountPrincipal("123456789012");
        var obj = JObject.Parse(JsonSerializer.Serialize(ap.PrincipalJson));
        Assert.Equal("123456789012", obj["AWS"]);
        Assert.NotNull(obj);
    }
}