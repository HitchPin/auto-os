using Newtonsoft.Json.Linq;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace Summer.IAM.Tests.Serialization;

public class StarrableArrayJsonConverterTest
{
    
    [Fact]
    public void WritesWildcard()
    {
        var starArr = StarrableArray.Star;
        var token = ToJsonNode(starArr);
        Assert.Equal(JTokenType.String, token.Type);
        Assert.Equal("*", ((JValue)token).Value<string>());
    }
    
    [Fact]
    public void WritesValues()
    {
        var starArr = StarrableArray.Of("s3:PutObject");
        var token = ToJsonNode(starArr);
        Assert.Equal(JTokenType.Array, token.Type);
        var arr = (JArray)token;
        Assert.Single(arr);
        Assert.Equal("s3:PutObject", ((JValue)arr[0]).Value<string>());
    }
    
    [Fact]
    public void ReadsWildcard()
    {
        var arr = FromJson("\"*\"");
        Assert.Equal(StarrableArray.Star, arr);
    }
    
    [Fact]
    public void ReadsValues()
    {
        var arr = FromJson(
            """
            [ "s3:PutObject", "dynamodb:PutItem" ]
            """);
        Assert.Equal("dynamodb:PutItem", arr.Items[0]);
        Assert.Equal("s3:PutObject", arr.Items[1]);
    }

    public StarrableArray FromJson(string j) => JsonSerializer.Deserialize<StarrableArray>(j);
    public JToken ToJsonNode(StarrableArray arr) => JToken.Parse(JsonSerializer.Serialize(arr));
}