using Pulumi;
using Summer.Core;

using Kms = Pulumi.AwsNative.Kms;

namespace Summer.Security;

public class EncryptionKey: ResourceRay
{
    public Kms.Key KmsKey { get; }
    public Kms.Alias KmsAlias { get; }
    
    public EncryptionKey(ResourceRay parent, string name, EncryptionKeyArgs args)
        : base(parent, name)
    {
        this.KmsKey = new Kms.Key($"{name}KmsKey", new Kms.KeyArgs()
        {

        }, new CustomResourceOptions() { Parent = this.UnderlyingResource });
        this.KmsAlias = new Kms.Alias($"{name}Alias", new Kms.AliasArgs()
        {
            AliasName = $"alias/{args.Name}",
            TargetKeyId = this.KmsKey.KeyId
        }, new CustomResourceOptions() { Parent = this.UnderlyingResource });
    }
    
    public Output<string> KeyId { get; set; }
}