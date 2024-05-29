using System.Text.Json;
using Newtonsoft.Json.Linq;
using Pulumi.AwsNative.DataBrew;
using Summer.IAM.Principals;
using Summer.Testing;

namespace Summer.IAM.Tests.Principals;

public class PrincipalBaseTest
{
    private static readonly IPrincipal Account1 = new AccountPrincipal("123456789012");
    
    [Fact]
    public async Task AddsConditions()
    {
        var conditioned = Account1.WithCondition(ConditionOperator.StringEquals, new ConditionProperties()
            .WithProperty("bucket-name", "asdf"));
        var conditions = await conditioned.Conditions.AsTask();
        var j = JObject.Parse(JsonSerializer.Serialize(conditions));
        Assert.True(j.ContainsKey("StringEquals"));
        var se = (JObject)j["StringEquals"];
        Assert.True(se.ContainsKey("bucket-name"));
        Assert.Equal("asdf", se["bucket-name"]);
    }

    [Fact]
    public void ReplacesConditions()
    {
        
    }
    
}