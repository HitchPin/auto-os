using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using Pulumi;
using Summer.IAM.Serialization;

namespace Summer.IAM.Principals;

public record CompositePrincipal : PrincipalBase, IPrincipal
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
    
    public CompositePrincipal WithPrincipal(IPrincipal p) => new CompositePrincipal(Principals.Add(p));
}