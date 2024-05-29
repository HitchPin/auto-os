using Summer.Environment;
using Summer.IAM.Principals;
using Summer.Testing;

namespace Summer.IAM.Tests.Principals;

public class ServicePrincipalTest : EnvTest
{
    
    [Fact]
    public async Task ChoosesPrincipalByRegionAsync()
    {
        TestEnv.Region = "us-east-1";
        var svc = new ServicePrincipal("logs.amazonaws.com");
        var pj = await svc.PrincipalJson.AsTask();
        var p = pj.Service.Items.First();
        Assert.Equal("logs.us-east-1.amazonaws.com", p);

        TestEnv.Region = "cn-north-1";
        var cnSvc = new ServicePrincipal("logs.amazonaws.com");
        var cnPj = await cnSvc.PrincipalJson.AsTask();
        var cp = cnPj.Service.Items.First();
        Assert.Equal("logs.cn-north-1.amazonaws.com.cn", cp);
        
    }
    
    [Fact]
    public async Task AllowsOverridingRegionAsync()
    {
        var svc = new ServicePrincipal("logs.amazonaws.com", "cn-north-1");
        var pj = await svc.PrincipalJson.AsTask();
        var p = pj.Service.Items.First();
        Assert.Equal("logs.cn-north-1.amazonaws.com.cn", p);
    }
}