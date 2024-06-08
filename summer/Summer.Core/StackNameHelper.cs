using System;
using System.Reflection;

namespace Summer.Core;

public static class StackNameHelper
{
    public static string InferBestNameForStack<T>()
    {
        var tType = typeof(T);
        if (tType.IsAssignableTo(typeof(INamedSeason)))
        {
            return (string)tType.GetProperty("StackName", BindingFlags.Public | BindingFlags.Static)!.GetValue(null)!;
        }
        else
        {
            return tType.Name
                .Replace("Stack", "", StringComparison.InvariantCultureIgnoreCase)
                .Replace("Season", "", StringComparison.InvariantCultureIgnoreCase);
        }
    }
}