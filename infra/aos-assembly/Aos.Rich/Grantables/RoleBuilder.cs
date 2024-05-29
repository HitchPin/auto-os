using System.Collections.Immutable;
using Aos.Rich.Identity.Principals;
using Aos.Rich.Policies;
using Pulumi.AwsNative.Iam;

namespace Aos.Rich.Grantables;

public record RoleBuilder
{
    public string Path { get; init; }
    public TimeSpan? MaxSessionDuration { get; init; }
    public string? RoleName { get; init; }
    public IPrincipal TrustedPrincipal { get; init; }
    public IImmutableList<ManagedPolicy> ManagedPolicies { get; init; } = ImmutableList.Create<ManagedPolicy>();
    public IImmutableDictionary<string, PolicyDocument> InlinePolicies { get; init; } = ImmutableDictionary.Create<string, PolicyDocument>();

    public RoleBuilder AddInlinePolicy(string name, PolicyDocument doc)
    {
        return this with
        {
            InlinePolicies = InlinePolicies.Add(name, doc)
        };
    }
    public RoleBuilder AddManagedPolicy(ManagedPolicy mp)
    {
        return this with
        {
            ManagedPolicies = ManagedPolicies.Add(mp)
        };
    }
}