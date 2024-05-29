using System.Text;
using Aos.DataModel;
using Pulumi;

namespace Aos.Cli;

public class InitialConfig
{
    public static readonly ClusterSpec Initial = new ClusterSpec()
    {
        ClusterName = "HpBeta",
        ClusterId = "a44t3gfD",
        Region = "us-west-2",
        Capacity = new CapacitySpec()
        {
            Providers = new List<CapacityProviderSpec>()
            {
                CapacityProviderSpec.EC2("general") with
                {
                    InstanceType = "c6g.large",
                    MaxCount = 3,
                    MinCount = 1,
                }
            },
        },
        Logging = LoggingSpec.Combined("Logs"),
        Snapshots = new SnapshotsSpec(),
        Customizations = new Customizations(),
        Networking = new NetworkingSpec()
        {
            VpcId = "vpc-0ed8c0b5582a99aec",
            SecurityGroupIds = new List<string>() { "sg-02c0d34b5cd5ca52e" },
            InternalClusterDomainName = "internal.hitchpin.com",
            SubnetIds = new List<string>()
            {
                "subnet-059c17426b121b95b",
                "subnet-02a773b125bdb6830",
                "subnet-00c8081acd9291c6e"
            }
        }
    };

    public static void EnsureSpecStored(Config config)
    {
        if (config.Get(ClusterSpec.ConfigKey) == null)
        {
            Console.WriteLine("Set initial config value:");
            Console.WriteLine(Convert.ToBase64String(Encoding.UTF8.GetBytes(Initial.ToJson())));
            throw new Exception();
        }
    }
}