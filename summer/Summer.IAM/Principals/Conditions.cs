using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text.Json.Serialization;
using Summer.IAM.Serialization;

namespace Summer.IAM.Principals;

[JsonConverter(typeof(ConditionsJsonConverter))]
public partial record Conditions
{
    private IImmutableDictionary<string, ConditionProperties> actionProps { get; init; } = ImmutableDictionary.Create<string, ConditionProperties>();

    public IEnumerable<string> OperatorKeys => actionProps.Keys.ToList();

    public ConditionProperties this[string key] => actionProps[key];
    
    public Conditions WithOperator(ConditionOperator @operator, ConditionProperties props)
    {
        if (actionProps.ContainsKey(@operator.OperatorKey))
        {
            var intersection = props.Keys.Intersect(actionProps.Keys);
            if (intersection.Any())
            {
                throw new ArgumentException("Operator already contains values that would be overwritten by these.");
            }

            var merged = actionProps[@operator.OperatorKey] + props;
            return this with
            {
                actionProps = actionProps.SetItem(@operator.OperatorKey, merged)
            };
        }
        else
        {
            return this with
            {
                actionProps = actionProps.SetItem(@operator.OperatorKey, props)
            };
        }
    }
}