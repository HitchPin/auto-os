namespace Summer.Core;

public record EnvironmentSettings
{
    public string Region { get; init; }
    public string? CredentialProfile { get; init; }
}