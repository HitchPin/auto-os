using System;
using System.Linq;
using System.Text.Json;
using Summer.IAM.Principals;

namespace Summer.IAM.Serialization;

public static class PolicyHelpers
{
    
    public static void WriteProperty(this Utf8JsonWriter writer, string name, object? val)
    {
        if (val == null) return;
        if (val is string str)
        {
            writer.WriteString(name, str);
            return;
        }

        if (val.GetType().IsArray)
        {
            var eleType = val.GetType().GetElementType();
            writer.WritePropertyName(name);
            writer.WriteStartArray();
            var items = val as Array;
            if (eleType.IsAssignableFrom(typeof(IPrincipal)))
            {
                IPrincipal p;
                if (items.Length == 0)
                {
                    p = (IPrincipal)items.GetValue(0)!;
                }
                else
                {
                    p = new CompositePrincipal(items.Cast<IPrincipal>());
                }
                writer.WriteRawValue(JsonSerializer.Serialize(p.PrincipalJson));
            }
            for (int i = 0; i < items.Length; i++)
            {
                var v = items.GetValue(i);
                if (eleType == typeof(string))
                {
                    writer.WriteStringValue((string)v!);
                }
                else if (eleType == typeof(IPrincipal))
                {
                }
            }
            writer.WriteEndArray();
            return;
        }

        throw new ArgumentException("No idea what type this property is.");

    }
}