using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Pulumi;
using Summer.IAM.Serialization;

namespace Summer.IAM;

[JsonConverter(typeof(StarrableArrayJsonConverter))]
public record struct StarrableArray
{
    private static readonly IImmutableList<string> EmptyArray = ImmutableList.Create<string>();
    private static readonly IImmutableList<string> StarArray = ImmutableList.Create<string>("*");
    private static readonly StarrableArray Empty_StarrableArray = new StarrableArray(EmptyArray);
    private static readonly StarrableArray Star_StarrableArray = new StarrableArray(StarArray);

    public StarrableArray()
    {
        Items = EmptyArray;
        IsStar = false;
    }
    private StarrableArray(IEnumerable<string> values)
    {
        var ls = values.ToList();
        if (ls.Any(a => a == "*"))
        {
            this.IsStar = true;
            this.Items = StarArray;
            return;
        }

        var distinctSorted = ls.Distinct().Order();
        this.IsStar = false;
        this.Items = distinctSorted.ToImmutableArray();
    }
    
    public bool IsStar { get; private set; }
    public bool IsEmpty => Items.Count == 0;
    public IImmutableList<string> Items { get; private set; }

    public static StarrableArray Star => Star_StarrableArray;
    public static StarrableArray Empty => Empty_StarrableArray;
    
    public static StarrableArray Of(params string[] values) => new StarrableArray(values);
    public static StarrableArray Of(IEnumerable<string> actions) => new StarrableArray(actions);

    public static implicit operator Output<StarrableArray>(StarrableArray pa) => Output<StarrableArray>.Create(Task.FromResult(pa));
    public static implicit operator StarrableArray(string pa) => new StarrableArray(new[] { pa });
    public static StarrableArray operator +(StarrableArray a1, StarrableArray a2)
    {
        var a1i = a1.Items.ToArray() ?? Array.Empty<string>();
        var a2i = a2.Items.ToArray() ?? Array.Empty<string>();
        return new StarrableArray(a1i.Concat(a2i));
    }
}