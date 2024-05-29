using System.Collections.Immutable;
using Pulumi;

namespace Aos.Rich.Policies;

public class PolicyActions
{
    private static readonly IImmutableList<string> StarActions = ImmutableList.Create<string>();
    private readonly bool isStar = false;
    private readonly IImmutableList<string> actions;

    private PolicyActions(IEnumerable<string> actions)
    {
        var ls = actions.ToList();
        if (ls.Any(a => a == "*"))
        {
            this.isStar = true;
            this.actions = StarActions;
        }

        var distinctSorted = ls.Distinct().Order();
        this.isStar = false;
        this.actions = distinctSorted.ToImmutableArray();
    }
    
    public bool IsAllActions { get; set; }
    public IImmutableList<string> Actions { get; set; }

    public static PolicyActions AllActionses => new PolicyActions(StarActions);
    
    public static PolicyActions OfAction(string action) => new PolicyActions(new []{action});
    public static PolicyActions OfActions(IEnumerable<string> actions) => new PolicyActions(actions);

    public static implicit operator Output<PolicyActions>(PolicyActions pa) => Output<PolicyActions>.Create(Task.FromResult(pa));
}