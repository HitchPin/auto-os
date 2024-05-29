
using System.Text.Json;
using Newtonsoft.Json.Linq;
using Summer.IAM.Principals;

namespace Summer.IAM.Tests.Serialization;

public class ConditionPropertiesJsonConverterTest
{
    [Fact]
    public void SerializesSingleAndArrayValues()
    {
        var cp = new ConditionProperties()
            .WithProperty("prop1", "asdf")
            .WithProperty("prop2", new[] { "val1", "val2" });
        var j = ToJsonNode(cp);
        Assert.Equal(JTokenType.String, j["prop1"].Type);
        Assert.Equal("asdf", j["prop1"].Value<string>());
        
        Assert.Equal(JTokenType.Array, j["prop2"].Type);
        Assert.Equal("val1", j["prop2"][0].Value<string>());
        Assert.Equal("val2", j["prop2"][1].Value<string>());
    }
    
    [Fact]
    public void DeserializesSingleAndArrayValues()
    {
        var json =
            """
            {
                "s3:prefix": [
                  "",
                  "home/",
                  "home/${aws:username}/"
                ],
                "aws:PrincipalTag/job-category": "iamuser-admin"
            }
            """;
        var cp = FromJson(json);
        Assert.Contains("s3:prefix", cp.Keys);
        Assert.Contains("aws:PrincipalTag/job-category", cp.Keys);

        Assert.Contains("", cp["s3:prefix"]!);
        Assert.Contains("home/", cp["s3:prefix"]!);
        Assert.Contains("home/${aws:username}/", cp["s3:prefix"]!);
        
        Assert.Contains("iamuser-admin", cp["aws:PrincipalTag/job-category"]!);
    }
    
    public ConditionProperties FromJson(string j) => JsonSerializer.Deserialize<ConditionProperties>(j);
    public JToken ToJsonNode(ConditionProperties arr) => JToken.Parse(JsonSerializer.Serialize(arr));
}