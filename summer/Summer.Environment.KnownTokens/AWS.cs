namespace Summer.Environment.KnownTokens;

public class AWS
{
    public const string AccountIdKey = "AWS::AccountId";
    public const string PartitionKey = "AWS::Partition";
    public const string RegionKey = "AWS::Region";
    public const string ParitionDnsSuffixKey = "AWS::ParitionDnsSuffix";
    public static readonly Token<string> AccountId = new (AccountIdKey);
    public static readonly Token<string> Partition = new (PartitionKey);
    public static readonly Token<string> Region = new(RegionKey);
    public static readonly Token<string> ParitionDnsSuffix = new(ParitionDnsSuffixKey);
}