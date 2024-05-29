using System.Reflection;
using System.Text;
using System.Text.Json;
using Aos.Rich.Identity.Principals;
using Aos.Rich.Serialization;

namespace Aos.Rich.Policies;

public record PolicyStatement
{
    public string? Sid { get; private init; }
    
    public StarrableArray? Actions { get; private init; } 
    public StarrableArray? NotActions { get; private init; }
    
    
    public IPrincipal? Principals { get; private init; }
    public IPrincipal? NotPrincipals { get; private init; }
    
    public StarrableArray? Resources { get; private init; }
    public StarrableArray? NotResources { get; private init; }
    
    public List<string> Conditions { get; private init; }
    public Effect Effect { get; private init; } = Effect.Allow;

    public PolicyStatement WithSid(string sid) => this with { Sid = sid };
    public PolicyStatement WithEffect(Effect effect) => this with { Effect = effect };
    
    #region "Actions"
    
    public PolicyStatement WithAction(string action) => WithActions(StarrableArray.Of(action));
    public PolicyStatement WithAllActions() => WithActions(StarrableArray.Star);
    public PolicyStatement WithActions(params string[] arr) => WithExactActionArray(StarrableArray.Of(arr));
    public PolicyStatement WithActions(StarrableArray arr) => WithExactActionArray(NotActions == null ? arr : NotActions + arr);
    public PolicyStatement ReplaceActions(StarrableArray arr) => WithExactActionArray(arr);
    
    private PolicyStatement WithExactActionArray(StarrableArray arr)
    {
        if (NotActions != default)
        {
            throw new ArgumentException("You cannot set both Actions and not actions in the same policy statement.");
        }

        return this with
        {
            Actions = arr
        };
    }
    #endregion
    
    #region "Not Actions"
    
    public PolicyStatement WithNotActions(string notAction) => WithNotActions(StarrableArray.Of(notAction));
    public PolicyStatement WithNoActions() => WithNotActions(StarrableArray.Star);
    public PolicyStatement WithNotActions(params string[] arr) => WithExactNotActionArray(StarrableArray.Of(arr));
    public PolicyStatement WithNotActions(StarrableArray arr) => WithExactNotActionArray(NotActions == null ? arr : NotActions + arr);
    public PolicyStatement ReplaceNotActions(StarrableArray arr) => WithExactNotActionArray(arr);

    private PolicyStatement WithExactNotActionArray(StarrableArray arr)
    {
        if (Actions != default)
        {
            throw new ArgumentException("You cannot set both Actions and not actions in the same policy statement.");
        }

        return this with
        {
            NotActions = arr
        };
    }
    
    #endregion
    
    #region "Principals / NotPrincipals"
    
    public PolicyStatement WithPrincipal(IPrincipal principal) => WithExactPrincipals(Principals == null ? principal : Principals + principal);
    public PolicyStatement WithAllPrincipals() => WithExactPrincipals(new WildcardPrincipal());
    public PolicyStatement ReplacePrincipal(IPrincipal principal) => WithExactPrincipals(principal);
    
    public PolicyStatement WithNotPrincipal(IPrincipal notPrincipal) => WithExactNotPrincipals(NotPrincipals == null ? notPrincipal : NotPrincipals + notPrincipal);
    public PolicyStatement WithNoPrincipals() => WithExactNotPrincipals(new WildcardPrincipal());
    public PolicyStatement ReplaceNotPrincipal(IPrincipal notPrincipal) => WithExactNotPrincipals(notPrincipal);

    private PolicyStatement WithExactPrincipals(IPrincipal p)
    {
        if (NotPrincipals != default)
        {
            throw new ArgumentException("You cannot set both Principals and NotPrincipals in the same policy statement.");
        }

        return this with
        {
            Principals = p
        };
    }
    private PolicyStatement WithExactNotPrincipals(IPrincipal p)
    {
        if (Principals != default)
        {
            throw new ArgumentException("You cannot set both Principals and NotPrincipals in the same policy statement.");
        }

        return this with
        {
            NotPrincipals = p
        };
    }
    #endregion

    #region "Resources"
    
    public PolicyStatement WithResource(string rsrc) => WithResources(StarrableArray.Of(rsrc));
    public PolicyStatement WithAllResources() => WithResources(StarrableArray.Star);
    public PolicyStatement WithResources(params string[] arr) => WithExactResourceArray(StarrableArray.Of(arr));
    public PolicyStatement WithResources(StarrableArray arr) => WithExactResourceArray(Resources == null ? arr : Resources + arr);
    public PolicyStatement ReplaceResources(StarrableArray arr) => WithExactResourceArray(arr);
    
    private PolicyStatement WithExactResourceArray(StarrableArray arr)
    {
        if (NotResources != default)
        {
            throw new ArgumentException("You cannot set both Resources and NotResources in the same policy statement.");
        }

        return this with
        {
            Actions = arr
        };
    }
    #endregion

    #region "Not Resources"
    
    public PolicyStatement WithNotResource(string notRsrc) => WithNotResources(StarrableArray.Of(notRsrc));
    public PolicyStatement WithNoResources() => WithNotResources(StarrableArray.Star);
    public PolicyStatement WithNotResources(params string[] notRsrc) => WithExactNotResourceArray(StarrableArray.Of(notRsrc));
    public PolicyStatement WithNotResources(StarrableArray notRsrc) => WithExactNotResourceArray(NotResources == null ? notRsrc : NotResources + notRsrc);
    public PolicyStatement ReplaceNotResources(StarrableArray notRsrc) => WithExactNotResourceArray(notRsrc);
    
    private PolicyStatement WithExactNotResourceArray(StarrableArray arr)
    {
        if (Resources != default)
        {
            throw new ArgumentException("You cannot set both Resources and NotResources in the same policy statement.");
        }

        return this with
        {
            Actions = arr
        };
    }
    #endregion

    public string ToJson()
    {
        using var ms = new MemoryStream();
        var writer = new Utf8JsonWriter(ms);
        WriteJson(writer);
        writer.Flush();
        var bin = ms.ToArray();
        var str = Encoding.UTF8.GetString(bin);
        return str;
    }
    
    public void WriteJson(Utf8JsonWriter writer)
    {
        writer.WriteStartObject();
        var props = typeof(PolicyStatement)
            .GetProperties(BindingFlags.Instance | BindingFlags.Public);
        foreach (var prop in props)
        {
            var myVal = prop.GetValue(this);
            var name = prop.Name;
            writer.WriteProperty(name, myVal);
        }
        writer.WriteEndObject();
    }
}