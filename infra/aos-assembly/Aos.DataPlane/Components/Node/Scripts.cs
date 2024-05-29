using System;
using System.IO;
using System.Reflection;

namespace Aos.DataPlane.Components.Node;

public static class Scripts
{
    private static readonly Type MyType = typeof(Scripts);
    private static readonly Assembly MyAssembly = MyType.Assembly;

    private static readonly Lazy<string> bootstrapScriptLay =
        new Lazy<string>(() => GetScriptText("bootstrapper-setup.sh"));
    private static readonly Lazy<string> normalScriptLazy =
        new Lazy<string>(() => GetScriptText("node-setup.sh"));

    public static string BootstrapScript => bootstrapScriptLay.Value;
    public static string NormalScript => normalScriptLazy.Value;
    
    private static string GetScriptText(string name)
    {
        using var s = MyAssembly.GetManifestResourceStream($"{MyType.Namespace}.${name}");
        using var reader = new StreamReader(s);
        return reader.ReadToEnd();
    }
}