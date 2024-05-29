namespace Aos.Rich.Grantables;

public record GrantParams
{
    public List<string> Actions { get; init; }
    public List<string> Resources { get; init; }
}