using Summer.IAM.Serialization;

namespace Summer.IAM.Tests.Serialization;

public class JsonPrincipalTest
{
    [Fact]
    public void AddsPrincipalsTogether()
    {
        var j1 = JsonPrincipal.OfAWS(StarrableArray.Star);
        var j2 = JsonPrincipal.OfService((StarrableArray.Star));
        Assert.True(j1.Service.IsEmpty);
        Assert.True(j2.AWS.IsEmpty);
        var sum = j1 + j2;
        Assert.True(sum.Service.IsStar);
        Assert.True(sum.AWS.IsStar);
        Assert.Equal(sum.AWS, j1.AWS);
        Assert.Equal(sum.Service, j2.Service);
    }
}