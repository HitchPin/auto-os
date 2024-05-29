using System.CommandLine;

namespace Aos.Cli.Destroy;

public class DestroyCmd
{
    public static Command Create(Program.DiBinder binder)
    {
        var destroyCmd = new Command("destroy", "Destroy deployed stacks.");
        var stacksOption = new Option<string[]?>(
            name: "--file",
            description: "The file to read and display on the console.")
        {
            Arity = ArgumentArity.ZeroOrMore,
            AllowMultipleArgumentsPerToken = true
        };
        destroyCmd.Add(stacksOption);
        destroyCmd.SetHandler((stacks, svc) =>
            {
                
            },
            stacksOption, binder);
        return destroyCmd;
    }
}