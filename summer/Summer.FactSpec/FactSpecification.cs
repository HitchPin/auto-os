using Pulumi;
using Summer.Core;

using SM = Pulumi.AwsNative.SecretsManager;
using SSM = Pulumi.Aws.Ssm;

namespace Summer.FactSpec;

public class FactSpecification : ResourceRay
{
    public SM.Secret? SecretsManagerSecret { get; }
    public SSM.Parameter? SystemManagerParameter { get; }
    
    public FactSpecification(ResourceRay parent, string name, FactSpecificationArgs args)
        : base(parent, name)
    {
        string factName = $"{this.Identifier.ParameterPathPrefix}" + args.Name;
        if (args.IsSecret)
        {
            this.SecretsManagerSecret = new SM.Secret($"{name}SecretsManagerSecret", new SM.SecretArgs()
            {
                Name = factName,
                Description = args.Description ?? "Secret for " + name,
                SecretString = args.Value,
                KmsKeyId = args.EncryptionKey.KeyId
            }, new CustomResourceOptions() { Parent = this.UnderlyingResource });
        }
        else
        {
            this.SystemManagerParameter = new SSM.Parameter($"{name}SSMParam", new SSM.ParameterArgs()
            {
                Name = factName,
                Tier = SSM.ParameterTier.IntelligentTiering,
                Type = SSM.ParameterType.String,
                Description = args.Description ?? "Secret for " + name
            }, new CustomResourceOptions() { Parent = this.UnderlyingResource });
        }
    }
}