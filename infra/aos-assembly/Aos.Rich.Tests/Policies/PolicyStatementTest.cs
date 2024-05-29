using System.Text.Json.Nodes;
using Aos.Rich.Policies;
using Newtonsoft.Json.Linq;

namespace Aos.Rich.Tests.Policies;

public class PolicyStatementTest
{
    [Fact]
    public void Serializes()
    {
        var ps = new PolicyStatement()
        {
            Actions = new List<string>() { "ssm:GetParameter" },
            Resources = new List<string>() { "asdf1", "sadf2" },
        };
        var json = ps.ToJson();
        var obj = JObject.Parse(json);

        var actions = obj["Actions"];
        Assert.IsType<JArray>(actions);

        var actionArr = (JArray)actions;
        Assert.Single(actionArr);
        Assert.Equal("ssm:GetParameter", actionArr[0].Value<string>());
        
        var rsrc = obj["Resources"];
        Assert.IsType<JArray>(rsrc);

        var rsrcArr = (JArray)rsrc;
        Assert.Equal(2, rsrcArr.Count);
        Assert.Equal("asdf1", rsrcArr[0].Value<string>());
        Assert.Equal("sadf2", rsrcArr[0].Value<string>());
    }
}