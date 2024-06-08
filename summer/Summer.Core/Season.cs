using System.Threading.Tasks;

namespace Summer.Core;

public abstract class Season<T> : ResourceRay where T : IAppIdentifier
{
    private readonly T appIdentity;

    public Season(App<T> app, string stackId, T appIdentity) : base(null, stackId)
    {
        this.App = app;
        this.appIdentity = appIdentity;
    }

    public App<T> App { get; }
    public T AppId => appIdentity;

    public virtual async Task BeforeConstructionAsync()
    {
        
    }
    public virtual async Task ConstructCloudResourcesAsync()
    {
        
    }
    
    public virtual async Task AfterConstructionAsync()
    {
        
    }
}


public static class Season
{
    public static bool IsSeason(object obj)
    {
        var objType = obj.GetType();
        return objType.FullName.Contains("Summer.Core.Season");
    }
}