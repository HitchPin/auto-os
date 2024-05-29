using System;

namespace Summer.IAM.Principals;

public readonly partial record struct ConditionOperator
{
    private readonly string conditionName;
    private readonly bool ifExists;
    private readonly string? multiValuePrefix;

    private ConditionOperator(string conditionName, bool ifExists, string? multiValuePrefix = null)
    {
        this.conditionName = conditionName;
        this.ifExists = ifExists;
        this.multiValuePrefix = multiValuePrefix;

        string opName = conditionName;
        if (multiValuePrefix != null)
        {
            opName = multiValuePrefix + ":" + opName;
        }

        if (ifExists)
        {
            opName += "IfExists";
        }

        this.OperatorKey = opName;
    }
    
    public string OperatorKey { get; }

    public ConditionOperator IfExists()
    {
        if (this.conditionName == "Null")
        {
            throw new ArgumentException(
                "Cannot use IfExists on Null.\nhttps://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html#Conditions_IfExists");
        }

        return new ConditionOperator(conditionName, true, multiValuePrefix);
    }
    
    public ConditionOperator ForAllValues()
    {
        return new ConditionOperator(conditionName, ifExists, multiValuePrefix: "ForAllValues");
    }
    public ConditionOperator ForAnyValue()
    {
        return new ConditionOperator(conditionName, ifExists, multiValuePrefix: "ForAnyValue");
    }

    public static ConditionOperator Create(string operatorName) => new ConditionOperator(operatorName, false, null);


}