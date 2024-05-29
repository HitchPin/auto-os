using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.CodeAnalysis;

namespace Summer.SchemaGen;

/// <summary>
/// A sample source generator that creates C# classes based on the text file (in this case, Domain Driven Design ubiquitous language registry).
/// When using a simple text file as a baseline, we can create a non-incremental source generator.
/// </summary>
[Generator]
public class PolicyConditionOperatorGenerator : ISourceGenerator
{
    public void Initialize(GeneratorInitializationContext context)
    {
    }

    public void Execute(GeneratorExecutionContext context)
    {
        var (path, ops) = GetOperators(context);
        if (path == null || ops == null) return;

        context.AddSource("Conditions.g.cs", GenerateConditionPartialClass(ops));
        context.AddSource("ConditionOperators.g.cs", GenerateConditionOperatorsPartialClass(ops));

    }

    private (string?, List<string>?) GetOperators(GeneratorExecutionContext context)
    {
        string? fileText = null;
        foreach (var additionalFile in context.AdditionalFiles)
        {
            if (additionalFile == null)
                continue;

            // Check if the file name is the specific file that we expect.
            if (Path.GetFileName(additionalFile.Path) != "ConditionOperators.txt")
                continue;

            var txt = additionalFile.GetText().ToString()
                .Split('\n')
                .Where(l => !string.IsNullOrEmpty(l.Trim()))
                .Select(l => l.Trim())
                .ToList();
            return (additionalFile.Path, txt);
        }

        return (null, null);
    }

    private string GenerateConditionPartialClass(List<string> ops)
    {
        var sb = new StringBuilder();
        sb.AppendLine(
            """
            using System.Collections.Immutable;

            namespace Summer.IAM.Principals;

            public partial record Conditions
            {

            """);

        foreach (var op in ops)
        {
            sb.AppendLine(
                $"""
                     public Conditions With{op}(ConditionProperties props) =>
                         WithOperator(ConditionOperator.{op}, props);
                 """);
        }
        foreach (var op in ops)
        {
            if (op == "Null") continue;
            sb.AppendLine(
                $"""
                     public Conditions With{op}IfExists(ConditionProperties props) =>
                         WithOperator(ConditionOperator.{op}.IfExists(), props);
                 """);
        }

        sb.AppendLine("}");
        return sb.ToString();
    }

    private string GenerateConditionOperatorsPartialClass(List<string> ops)
    {
        var sb = new StringBuilder();
        sb.AppendLine(
            """
            namespace Summer.IAM.Principals;

            public readonly partial record struct ConditionOperator
            {
            """);
        foreach (var op in ops)
        {
            sb.AppendLine(
                $"""
                public static readonly ConditionOperator {op} = Create("{op}");
                """);
        }

        sb.AppendLine("}");
        return sb.ToString();
    }
    
}