using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text.Json.Serialization;
using Summer.IAM.Serialization;

namespace Summer.IAM.Principals;

[JsonConverter(typeof(ConditionPropertiesJsonConverter))]
public record ConditionProperties
{
    private IImmutableDictionary<string, IImmutableList<string>> props { get; init; } = ImmutableDictionary.Create<string, IImmutableList<string>>();

    public IEnumerable<string> Keys => props.Keys;

    public IImmutableList<string>? this[string key] => props.ContainsKey(key) ? props[key] : null;
    
    public ConditionProperties WithProperty(string property, string matchedValue)
    {
        if (props.ContainsKey(property))
        {
            throw new ArgumentException("Key already exists. Use WithPropertyValue to append.");
        }

        return this with
        {
            props = props.Add(property, new List<string>(new[] { matchedValue }).ToImmutableList())
        };
    }

    public ConditionProperties WithProperty(string property, string first, params string[] matchedValues)
    {
        var items = new List<string>();
        items.Add(first);
        if (matchedValues != null)
        {
            foreach (var mv in matchedValues)
            {
                items.Add(mv);
            }
        }

        return WithProperty(property, items);
    }
    public ConditionProperties WithProperty(string property, IEnumerable<string> matchedValues)
    {
        if (props.ContainsKey(property))
        {
            throw new ArgumentException("Key already exists. Use WithPropertyValue to append.");
        }

        return this with
        {
            props = props.Add(property, new List<string>(matchedValues).ToImmutableList())
        };
    }
    
    public ConditionProperties WithPropertyValue(string property, string matchedValue)
    {
        if (props.ContainsKey(property))
        {
            return this with
            {
                props = props.SetItem(property, props[property].Add(matchedValue))
            };
        }
        else
        {
            return this with
            {
                props = props.Add(property, ImmutableList.Create<string>().Add(matchedValue))
            };
        }
    }

    public ConditionProperties WithPropertyValues(string property, params string[] matchedValues) =>
        WithPropertyValues(property, matchedValues);
    public ConditionProperties WithPropertyValues(string property, IEnumerable<string> matchedValues)
    {
        if (props.ContainsKey(property))
        {
            return this with
            {
                props = props.SetItem(property, props[property].AddRange(matchedValues))
            };
        }
        else
        {
            return this with
            {
                props = props.Add(property, ImmutableList.Create<string>().AddRange(matchedValues))
            };
        }
    }

    public static ConditionProperties operator +(ConditionProperties c1, ConditionProperties c2)
    {
        var c1k = c1.Keys.ToHashSet();
        ConditionProperties result = c1;
        foreach (var k in c2.Keys)
        {
            if (c1k.Contains(k))
            {
                throw new ArgumentException("Operator already contains values that would be overwritten by these.");
            }

            result = result.WithProperty(k, c2[k]!);
        }

        return result;
    }
}