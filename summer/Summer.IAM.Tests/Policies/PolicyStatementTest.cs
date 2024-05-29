using Newtonsoft.Json.Linq;
using Summer.IAM.Policies;
using Summer.Testing;

namespace Summer.IAM.Tests.Policies;

public class PolicyStatementTest
{
    [Fact]
    public async Task SerializesAllRelevantFields()
    {
        var stmt = await new PolicyStatement()
            .WithAction("s3:PutObject")
            .WithResource("asefd")
            .ToJson()
            .AsTask();
        var j = JObject.Parse(stmt);
        
    }
    [Fact]
    public void PreventsSettingActionAndNotAction()
    {
        Exception? ex = null;
        try
        {
            new PolicyStatement()
                .WithAction("s3:GetObject")
                .WithNotAction("s3:PutObject");
        }
        catch (ArgumentException argX)
        {
            ex = argX;
        }

        Assert.NotNull(ex);
    }
    
    [Fact]
    public void PreventsSettingResourceAndNotResource()
    {
        Exception? ex = null;
        try
        {
            new PolicyStatement()
                .WithResource("s3:bucket")
                .WithNotResource("s3:other-bucket");
        }
        catch (ArgumentException argX)
        {
            ex = argX;
        }

        Assert.NotNull(ex);
    }
}