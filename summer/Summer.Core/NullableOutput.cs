using Pulumi;

namespace Summer.Core;

public class NullableOutput<T>
{
    public NullableOutput()
    {
        IsNull = true;
    }
    public NullableOutput(T val)
    {
        if (val == null)
        {
            IsNull = true;
        }
        else
        {
            IsNull = false;
            Value = val;
        }
        
    }
    public bool IsNull { get; }
    public T Value { get; set; }
}