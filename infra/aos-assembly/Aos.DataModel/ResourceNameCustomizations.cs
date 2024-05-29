namespace Aos.DataModel;

public record ResourceNameCustomizations
{
    public string HyphenatedName { get; init; }
    public string TitlePrefix { get; init; }
    public string QualifiedPrefix { get; init; }
}