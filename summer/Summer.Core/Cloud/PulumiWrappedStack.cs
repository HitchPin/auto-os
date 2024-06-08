using System.Threading.Tasks;
using Pulumi;

namespace Summer.Core.Cloud;

public class PulumiWrappedStack<TAppId, TSeason> : Stack
    where TAppId : IAppIdentifier
    where TSeason : Season<TAppId>
{
    public PulumiWrappedStack(TSeason s)
    {
        async Task<string> SetupStackAsync()
        {
            await s.BeforeConstructionAsync();
            await s.ConstructCloudResourcesAsync();
            await s.AfterConstructionAsync();
            return s.GetType().Name;
        }
        this.Result = Output.Create(SetupStackAsync());
        RegisterOutputs();
    }
    
    [Output]
    public Output<string> Result { get; set; }
}