using System.Text.Json;

namespace Aos.PlanarFoundation;

public static class IamExtensions
{
    public static string ServicePrincipalTrustPolicy(string servicePrincipal) => JsonSerializer.Serialize(
        new Dictionary<string, object?>
        {
            ["Version"] = "2012-10-17",
            ["Statement"] = new[]
            {
                new Dictionary<string, object?>
                {
                    ["Action"] = "sts:AssumeRole",
                    ["Effect"] = "Allow",
                    ["Sid"] = "",
                    ["Principal"] = new Dictionary<string, object?>
                    {
                        ["Service"] = servicePrincipal
                    },
                },
            },
        });
    
    public static string SimpleDoc(string[] actions, string[] resources) =>JsonSerializer.Serialize(
        new Dictionary<string, object?>
        {
            ["Version"] = "2012-10-17",
            ["Statement"] = new[]
            {
                new Dictionary<string, object?>
                {
                    ["Action"] = actions,
                    ["Effect"] = "Allow",
                    ["Resource"] = resources
                },
            },
        });
    public static string SimpleDoc(params SimpleStatement[] stmts) =>JsonSerializer.Serialize(
        new Dictionary<string, object?>
        {
            ["Version"] = "2012-10-17",
            ["Statement"] = stmts.Select(s => new[]
            {
                new Dictionary<string, object?>
                {
                    ["Action"] = s.Actions,
                    ["Effect"] = "Allow",
                    ["Resource"] = s.Resources
                },
            }),
        });

    public record SimpleStatement(string[] Actions, string[] Resources);
}