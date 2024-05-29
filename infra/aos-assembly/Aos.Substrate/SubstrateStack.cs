using Aos.DataModel;
using Aos.PlanarFoundation;
using Pulumi;
using Pulumi.Aws.ServiceDiscovery;
using Pulumi.AwsNative.Kms;
using Pulumi.AwsNative.S3;
using Pulumi.AwsNative.SecretsManager;
using Pulumi.AwsNative.SecretsManager.Inputs;
using Alias = Pulumi.AwsNative.Kms.Alias;

namespace Aos.Substrate;

public class SubstrateStack: PlanarStack, IPlanarStack
{
    public SubstrateStack()
    {
        var ns = new PrivateDnsNamespace("DiscoNs", new PrivateDnsNamespaceArgs()
        {
            Vpc = Spec.Networking.VpcId,
            Name = Spec.Networking.InternalClusterDomainName
        }, new CustomResourceOptions() { Parent = this });

        var kms = new Key("Key", new KeyArgs()
        {
            Enabled = true,
            EnableKeyRotation = true
        }, new CustomResourceOptions() { Parent = this });
        
        var kmsAlias = new Alias("Alias", new AliasArgs()
        {
            AliasName = "alias/" + Spec.GetHyphenatedPrefix() + "-key",
            TargetKeyId = kms.KeyId
        }, new CustomResourceOptions() { Parent = this });

        var superAdminSecret = new Secret("SuperAdmin", new SecretArgs()
        {
            Name = Spec.GetQualifiedPrefix() + "/superAdmin",
            KmsKeyId = kms.KeyId,
            GenerateSecretString = new SecretGenerateSecretStringArgs()
            {
                
            }
        }, new CustomResourceOptions() { Parent = this });

        var bucketName = Spec.GetHyphenatedPrefix() + "-conf";
        var confBucket = new Bucket("ConfBucket", new BucketArgs()
        {
            BucketName = bucketName
        }, new CustomResourceOptions() { Parent = this });
        
        this.DiscoNamespaceId = ns.Id;
        this.DiscoNamespaceName = ns.Name;
        this.EncryptionKeyId = kmsAlias.Id;
        this.SuperAdminSecretId = superAdminSecret.Id;
        this.ConfBucketName = confBucket.BucketName!;
    }

    [Output]
    public Output<string> DiscoNamespaceName { get; set; }
    [Output]
    public Output<string> DiscoNamespaceId { get; set; }
    
    [Output]
    public Output<string> EncryptionKeyId { get; set; }
    [Output]
    public Output<string> SuperAdminSecretId { get; set; }
    
    [Output]
    public Output<string> ConfBucketName { get; set; }
    public static string Name => "Substrate";
}