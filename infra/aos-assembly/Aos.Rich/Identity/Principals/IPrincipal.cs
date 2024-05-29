using System.Text.Json.Nodes;
using Aos.Rich.Serialization;
using Pulumi;

namespace Aos.Rich.Identity.Principals;

public interface IPrincipal
{
    public Output<StarrableArray> AssumeRoleAction { get; }
    public Output<JsonPrincipal> PrincipalJson { get; }
    
    public static IPrincipal operator +(IPrincipal p1, IPrincipal p2)
    {
        var principals = new List<IPrincipal>();
        if (p1 is CompositePrincipal c1)
        {
            principals.AddRange(c1.Principals);
        }
        else
        {
            principals.Add(p1);
        }

        if (p2 is CompositePrincipal c2)
        {
            principals.AddRange(c2.Principals);
        }
        else
        {
            principals.Add(p1);
        }

        return new CompositePrincipal(principals);
    }
}