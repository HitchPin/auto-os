using Summer.IAM.Principals;
using Summer.Testing;

namespace Summer.IAM.Tests.Principals;

public class CompositePrincipalTest : EnvTest
{
    private readonly IPrincipal Wildcard;
    private readonly IPrincipal Account1; 
    private readonly IPrincipal Account2; 
    private readonly IPrincipal Logs1;
    private readonly IPrincipal Logs2;

    public CompositePrincipalTest()
    {
        Wildcard = new WildcardPrincipal();
        Account1 = new AccountPrincipal("123456789012");
        Account2 = new AccountPrincipal("012345678901");
        Logs1  = new ServicePrincipal("logs.amazonaws.com");
        Logs2  = new ServicePrincipal("logs.amazonaws.com", "cn-north-1");
    }
    
    [Fact]
    public void CombinesStarPrincipalsCorrectly()
    {
        var combinedWc = Wildcard + Account1;
        Assert.IsType<WildcardPrincipal>(combinedWc);
    }
    
    [Fact]
    public async Task CombinesPrincipalsOfDifferentTypes()
    {
        var combinedWc = Account1 + Logs1;
        Assert.IsType<CompositePrincipal>(combinedWc);
        var j = await combinedWc.PrincipalJson.AsTask();
        Assert.Contains("arn:aws:iam::123456789012:root", j.AWS.Items);
        Assert.Contains("logs.us-west-2.amazonaws.com", j.Service.Items);
    }
    
    [Fact]
    public async Task CombinesPrincipalsOfSameTypes()
    {
        var combinedWc = Account1 + Account2;
        Assert.IsType<CompositePrincipal>(combinedWc);
        var j = await combinedWc.PrincipalJson.AsTask();
        Assert.Contains($"arn:aws:iam::123456789012:root", j.AWS.Items);
        Assert.Contains("arn:aws:iam::012345678901:root", j.AWS.Items);
    }
    
    
    [Fact]
    public async Task FlattensNestedComposites()
    {
        var c1 = Account1 + Account2;
        var c2 = Logs1 + Logs2;
        Assert.IsType<CompositePrincipal>(c1);
        Assert.IsType<CompositePrincipal>(c2);
        var sum = c1 + c2;
        Assert.IsType<CompositePrincipal>(sum);
        var j = await sum.PrincipalJson.AsTask();
        
        Assert.Contains($"arn:aws:iam::123456789012:root", j.AWS.Items);
        Assert.Contains("arn:aws:iam::012345678901:root", j.AWS.Items);

        TestEnv.Region = "us-west-2";
        Assert.Contains($"logs.us-west-2.amazonaws.com", j.Service.Items);
        Assert.Contains("logs.cn-north-1.amazonaws.com.cn", j.Service.Items);
    }
}