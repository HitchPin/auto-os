using Pulumi;
using Pulumi.AwsNative.Kms;
using Summer.IAM.Principals;
using Alias = Pulumi.AwsNative.Kms.Alias;

namespace Summer.Demo;

public class EncryptionKey : ComponentResource
{
    public EncryptionKey(Resource parent, string name, EncryptionKeyArgs keyArgs)
        : base("Summer::EncryptionKey", name, keyArgs, new ComponentResourceOptions() { Parent = parent })
    {
        this.KmsKey = new Key($"{name}KmsKey", new KeyArgs()
        {
            Description = keyArgs.Description ?? $"Encryption key for {keyArgs.Name}",
            EnableKeyRotation = true,
            Enabled = true,
            KeySpec = KeySpec.SymmetricDefault,
            KeyUsage = KeyUsage.EncryptDecrypt
        }, new CustomResourceOptions() { Parent = this });
        this.KmsAlias = new Alias($"{name}KmsAlias", new AliasArgs()
        {
            TargetKeyId = this.KmsKey.KeyId,
            AliasName = "alias/" + keyArgs.Name
        }, new CustomResourceOptions() { Parent = this });
        RegisterOutputs();
    }
    
    public Key KmsKey { get; set; }
    public Alias KmsAlias { get; set; }
    
    [Output]
    public Output<string> KeyId { get; set;  }

    public void GrantDecrypt(IPrincipal p)
    {
        
    }
}