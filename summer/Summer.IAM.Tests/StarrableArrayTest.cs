namespace Summer.IAM.Tests;

public class StarrableArrayTest
{
    [Fact]
    public void CreatesAndIdentifiesWildcard()
    {
        var arr = StarrableArray.Star;
        Assert.True(arr.IsStar);
        Assert.False(arr.IsEmpty);
        Assert.Single(arr.Items);
        Assert.Equal("*", arr.Items[0]);
    }
    
    [Fact]
    public void CreatesAndIdentifiesEmpty()
    {
        var arr = StarrableArray.Empty;
        Assert.False(arr.IsStar);
        Assert.True(arr.IsEmpty);
        Assert.Empty(arr.Items);
    }
    
    [Fact]
    public void ConvertsStarInListToEntireStar()
    {
        var arr = StarrableArray.Of("sts:AssumeRole", "*");
        Assert.True(arr.IsStar);
        Assert.False(arr.IsEmpty);
        Assert.Single(arr.Items);
        Assert.Equal("*", arr.Items[0]);
    }
    
    [Fact]
    public void SavesDistinctItemsInAlphabeticalOrderIfNoWildcards()
    {
        var arr = StarrableArray.Of("s3:PutObject", "dynamodb:PutItem", "events:PutEvents");
        Assert.False(arr.IsStar);
        Assert.False(arr.IsEmpty);
        Assert.Equal(3, arr.Items.Count);
        Assert.Equal("dynamodb:PutItem", arr.Items[0]);
        Assert.Equal("events:PutEvents", arr.Items[1]);
        Assert.Equal("s3:PutObject", arr.Items[2]);
    }
    
    [Fact]
    public void CorrectlySumsValues()
    {
        var arr = StarrableArray.Of("s3:PutObject") + StarrableArray.Of("s3:GetObject");
        Assert.False(arr.IsStar);
        Assert.False(arr.IsEmpty);
        Assert.Equal(2, arr.Items.Count);
        Assert.Equal("s3:GetObject", arr.Items[0]);
        Assert.Equal("s3:PutObject", arr.Items[1]);
    }
}