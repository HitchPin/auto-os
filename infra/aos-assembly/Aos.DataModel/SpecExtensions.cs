using System.Text;

namespace Aos.DataModel;

public static class SpecExtensions
{
    public static string GetTitledPrefix(this ClusterSpec s)
    {
        string prefix;
        if (!string.IsNullOrEmpty(s.Customizations?.ResourceName?.TitlePrefix))
        {
            prefix = s.Customizations!.ResourceName!.TitlePrefix!;
        }
        else
        {
            prefix = s.ClusterName;
        }

        return prefix + s.ClusterId;
    }

    public static string GetHyphenatedPrefix(this ClusterSpec s)
    {
        string prefix;
        if (!string.IsNullOrEmpty(s.Customizations?.ResourceName?.HyphenatedName))
        {
            prefix = s.Customizations!.ResourceName!.HyphenatedName!;
        }
        else
        {
            prefix = ToUnderscoreCase(s.ClusterName);
        }

        prefix += "-" + s.ClusterId;
        return prefix;
    }
    
    public static string GetQualifiedPrefix(this ClusterSpec s)
    {
        string prefix;
        if (!string.IsNullOrEmpty(s.Customizations?.ResourceName?.QualifiedPrefix))
        {
            prefix = s.Customizations!.ResourceName!.QualifiedPrefix!;
        }
        else
        {
            prefix = ToUnderscoreCase(s.ClusterName).Replace("_", "/");
        }

        prefix += "-" + s.ClusterId;
        return prefix;
    }

    public static string ToUnderscoreCase(this string str) {
        return string.Concat(str.Select((x, i) => i > 0 && char.IsUpper(x) ? "_" + x.ToString() : x.ToString())).ToLower();
    }
}