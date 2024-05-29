using System.CommandLine;
using Aos.DataModel;
using Microsoft.Extensions.DependencyInjection;

namespace Aos.Cli.Deploy;

public class DeployCmd
{
    public static Command Create(Program.DiBinder binder)
    {
        var deployCmd = new Command("deploy", "Start a deployment");
        var stacksOption = new Option<string[]?>(
            name: "--file",
            description: "The file to read and display on the console.")
        {
            Arity = ArgumentArity.ZeroOrMore,
            AllowMultipleArgumentsPerToken = true
        };
        deployCmd.Add(stacksOption);
        deployCmd.SetHandler(async (stacks, svc) =>
            {
                var cs = svc.GetRequiredService<ClusterSpec>();
                var deployer = svc.GetRequiredService<Deployer>()!;
                await deployer.DeployAsync(cs, stacks);
            },
            stacksOption, binder);
        return deployCmd;
    }
}