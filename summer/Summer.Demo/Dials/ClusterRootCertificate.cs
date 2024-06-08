using Pulumi;
using Pulumi.AwsNative.Kms;
using Pulumi.AwsNative.SecretsManager;
using Pulumi.AwsNative.SecretsManager.Inputs;
using Summer.Core;
using KmsAlias = Pulumi.AwsNative.Kms.Alias;

namespace Summer.Demo.Dials;

public class ClusterRootCertificate : ResourceRay
{
    public ClusterRootCertificate(ResourceRay parent, string name)
        : base(parent, name)
    {
        var args = ((Season<SummerId>)this.Season).AppId;
        this.EncryptionKey = new Key("Encryption", new KeyArgs()
        {
            Enabled = true,
            EnableKeyRotation = true
        }, new CustomResourceOptions() { Parent = this.UnderlyingResource });
        new KmsAlias("EncryptionKeyAlias", new AliasArgs()
        {
            TargetKeyId = this.EncryptionKey.Id,
            AliasName = $"{args.ClusterName}${args.ClusterId}"
        }, new CustomResourceOptions() { Parent = this.UnderlyingResource });
        this.CertificateSecret = new Secret("CertSecret", new SecretArgs()
        {
            Name = $"/{args.ClusterName}{args.ClusterId}/",
            GenerateSecretString = new SecretGenerateSecretStringArgs()
        }, new CustomResourceOptions() { Parent = this.UnderlyingResource });
    }
    
    public Secret CertificateSecret { get; }
    public Key EncryptionKey { get;  }
}