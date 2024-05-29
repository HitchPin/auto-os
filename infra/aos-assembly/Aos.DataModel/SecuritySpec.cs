namespace Aos.DataModel;

public record SecuritySpec
{
    public string EncryptionKeyId { get; init; }
    public string SuperAdminCredentialsSecretId { get; init; }
}