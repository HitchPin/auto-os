using System.Collections.Immutable;
using Aos.Rich.Policies;
using Pulumi;
using Pulumi.AwsNative.FraudDetector;

namespace Aos.Rich.Serialization;

public class StarrableArray
{
    private static readonly IImmutableList<string> StarValues = ImmutableList.Create<string>();
    private readonly bool isStar = false;
    private readonly IImmutableList<string> items;

    private StarrableArray(IEnumerable<string> values)
    {
        var ls = values.ToList();
        if (ls.Any(a => a == "*"))
        {
            this.isStar = true;
            this.items = StarValues;
        }

        var distinctSorted = ls.Distinct().Order();
        this.isStar = false;
        this.items = distinctSorted.ToImmutableArray();
    }
    
    public bool IsStar { get; set; }
    public IImmutableList<string> Items { get; set; }

    public static StarrableArray Star => new StarrableArray(StarValues);
    
    public static StarrableArray Of(params string[] values) => new StarrableArray(values);
    public static StarrableArray Of(IEnumerable<string> actions) => new StarrableArray(actions);

    public static implicit operator Output<StarrableArray>(StarrableArray pa) => Output<StarrableArray>.Create(Task.FromResult(pa));
    public static implicit operator StarrableArray(string pa) => new StarrableArray(new[] { pa });
    public static StarrableArray operator +(StarrableArray a1, StarrableArray a2)
    {
        if (a1.IsStar || a2.isStar) return Star;
        var a1i = a1?.Items?.ToArray() ?? Array.Empty<string>();
        var a2i = a2?.Items?.ToArray() ?? Array.Empty<string>();
        return new StarrableArray(a1i.Concat(a2i));
    }
}