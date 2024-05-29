
using Summer.IAM.Principals;
using Summer.Testing;

namespace Summer.IAM.Tests.Principals;

public class AccountPrincipalTest : EnvTest
{
    [Fact]
    public async Task SetsCorrectArn()
    {
        var sp = new AccountPrincipal("123456789012");
        var principalJson = await sp.PrincipalJson.AsTask();
        var accountArn = principalJson.AWS.Items.First();
        Assert.Equal("arn:aws:iam::123456789012:root", accountArn);

        TestEnv.Partition = "aws-cn";
        
        var cnSp = new AccountPrincipal("0987654321");
        var cnPrincipalJson = await cnSp.PrincipalJson.AsTask();
        var cnAccountId = cnPrincipalJson.AWS.Items.First();
        Assert.Equal("arn:aws-cn:iam::0987654321:root", cnAccountId);
    }
}