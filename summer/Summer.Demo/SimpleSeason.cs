using System.Threading.Tasks;
using Summer.Core;

namespace Summer.Demo;

public class SimpleSeason : Season<SummerId>
{
    
    public Summer.Security.EncryptionKey Key { get; private set; }
    
    public SimpleSeason(App<SummerId> app, string name, SummerId id) : base(app, name, id)
    {
    }

    public override async Task ConstructCloudResourcesAsync()
    {
        this.Key = new Summer.Security.EncryptionKey(this, "Key", new Summer.Security.EncryptionKeyArgs()
        {
            Name = "test-encryption-key"
        });
    }
}