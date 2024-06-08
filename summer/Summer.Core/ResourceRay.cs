using System;
using System.Collections.Generic;
using Pulumi;

namespace Summer.Core;

public abstract class ResourceRay
{
    private readonly Dictionary<string, ResourceRay> children = new Dictionary<string, ResourceRay>();
    private readonly ComponentResource underlyingResource;
    public ResourceRay(ResourceRay? parent, string name)
    {
        this.Parent = parent;
        if (this.Parent != null)
        {
            this.Parent.AddChild(name, this);
            this.underlyingResource = new ComponentResource(
                this.GetType().FullName.Replace(".", ":"), name);
        }
        
        this.Name = name;
    }
    
    public string Name { get; }
    protected ResourceRay Parent { get; }
    protected object Season => GetStack();
    protected IAppIdentifier Identifier => GetAppId();
    protected ComponentResource UnderlyingResource => underlyingResource;

    protected void AddChild(string name, ResourceRay child)
    {
        if (children.ContainsKey(name))
        {
            throw new ArgumentException("There is already a child with that name.");
        }
        children.Add(name, child);
    }


    private object GetStack()
    {
        var rr = this;
        while (rr != null)
        {
            if (Summer.Core.Season.IsSeason(rr)) return rr;
            rr = rr.Parent;
        }

        throw new ArgumentException("No stack found in tree.");
    }

    private IAppIdentifier GetAppId()
    {
        var season = GetStack();
        var appIdProp = season.GetType().GetProperty("AppId");
        return (IAppIdentifier)appIdProp.GetValue(season);
    }
}