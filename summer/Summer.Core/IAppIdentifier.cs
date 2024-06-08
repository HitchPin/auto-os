namespace Summer.Core;

public interface IAppIdentifier
{
    string ParameterPathPrefix { get; }
    string TitlePrefix { get; }
    string Id { get; }
}