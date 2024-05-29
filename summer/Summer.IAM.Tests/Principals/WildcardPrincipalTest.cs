using Summer.Environment;
using Summer.IAM.Principals;
using Summer.Testing;

namespace Summer.IAM.Tests.Principals;

public class WildcardPrincipalTest
{
    public WildcardPrincipalTest()
    {
        Summertime.RestartAsync().GetAwaiter().GetResult();
        Summertime.RegisterProvider<TestEnvProvider>();
    }

    [Fact]
    public async Task WildcardPrincipalReturnsAsterisk()
    {
        var wc = new WildcardPrincipal();
        var pj = await wc.PrincipalJson.AsTask();
        Assert.True(pj.IsStar);
    }
}