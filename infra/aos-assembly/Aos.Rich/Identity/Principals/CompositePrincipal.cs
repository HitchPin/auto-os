using System.Collections.Immutable;
using Aos.Rich.Serialization;
using Pulumi;

namespace Aos.Rich.Identity.Principals;

public record CompositePrincipal : IPrincipal
{
    public CompositePrincipal(IEnumerable<IPrincipal> principals)
    {
        this.Principals = principals.ToImmutableList();
        AssumeRoleAction = Output.All(Principals.Select(p => p.AssumeRoleAction))
            .Apply(aras => aras.Aggregate(aras.First(),
                (acc, i) => acc + i));
        PrincipalJson = Output.All(Principals.Select(p => p.PrincipalJson))
            .Apply(arap => arap.Aggregate(arap.First(),
                (acc, i) => acc + i));
    }
    public IImmutableList<IPrincipal> Principals { get; }

    public Output<StarrableArray> AssumeRoleAction { get; }
    public Output<JsonPrincipal> PrincipalJson { get; }

    public CompositePrincipal WithPrincipal(IPrincipal p) => new CompositePrincipal(Principals.Add(p));
}