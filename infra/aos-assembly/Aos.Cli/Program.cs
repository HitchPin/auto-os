using System.CommandLine;
using System.CommandLine.Binding;
using Aos.Cli.Deploy;
using Aos.ControlPlane;
using Aos.Core;
using Aos.DataModel;
using Aos.DataPlane;
using Aos.Substrate;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Aos.Cli;

public class Program
{
    static async Task<int> Main(string[] args)
    {

        var rootCommand = new RootCommand("Aos.Core.Cli tool to deploy AutoOpenSearch.");
        var diBinder = ConfigureGlobalOptionsAndBinder(rootCommand);
        rootCommand.AddCommand(Deploy.DeployCmd.Create(diBinder));
        rootCommand.AddCommand(CreateInitCmd());
        
        return await rootCommand.InvokeAsync(args);
    }

    private static Command CreateInitCmd()
    {
        var initCmd = new Command("init", "Destroy deployed stacks.");
        var outLocation = new Option<string>("--out")
        {
            Arity = ArgumentArity.ZeroOrMore,
            AllowMultipleArgumentsPerToken = true
        };
        initCmd.Add(outLocation);
        initCmd.SetHandler(async (outLoc) =>
            {
                string loc = string.IsNullOrEmpty(outLoc) ? "cluster_spec.json" : outLoc;
                var json = InitialConfig.Initial.ToJson();
                await File.WriteAllTextAsync(loc, json);
            },
            outLocation);
        return initCmd;
    }
    
    private static DiBinder ConfigureGlobalOptionsAndBinder(RootCommand rootCommand)
    {
        var logLevelOption = new Option<LogLevel>
            (name: "--ll", description: "Log level", getDefaultValue: () => LogLevel.Error)
            {
                IsRequired = false,
                
            };
        var clusterConfigLocOption = new Option<FileInfo>
            (name: "--spec", description: "Cluster config location.")
            {
                IsRequired = false,
                
            };
        var gOptions = new GlobalOptions()
        {
            LogLevel = logLevelOption,
            ClusterConf = clusterConfigLocOption
        };
        rootCommand.AddGlobalOption(logLevelOption);
        return new DiBinder(gOptions);
    }

    static IServiceProvider CreateServices(LogLevel ll, ClusterSpec? spec)
    {
        var svc = new ServiceCollection();
        svc.AddLogging((l) =>
        {
            l.SetMinimumLevel(ll)
                .AddFilter("Microsoft", LogLevel.Warning)
                .AddFilter("System", LogLevel.Warning)
                .AddFilter("OpenSearch.Plugins", LogLevel.Information)
                .AddFilter("Hp.Cli", LogLevel.Debug)
                .AddConsole();
        });

        if (spec != null)
        {
            svc.AddSingleton(spec);
        }
        svc.AddSingleton(new AppBuilder()
            .RegisterStack<SubstrateStack>()
            .RegisterStack<ControlPlaneStack>((s) => new ControlPlaneStack(s.GetRequiredService<SubstrateStack>()))
            .RegisterStack<DataPlaneStack>((s) => new DataPlaneStack(
                s.GetRequiredService<SubstrateStack>(),
                s.GetRequiredService<ControlPlaneStack>()))
            .Build());
        svc.AddSingleton<Deployer>();
        return svc.BuildServiceProvider();
    }
    
    public record GlobalOptions
    {
        public Option<FileInfo> ClusterConf { get; init; }
        public Option<LogLevel> LogLevel { get; init; }
    }
    
    public class DiBinder : BinderBase<IServiceProvider>
    {
        private readonly GlobalOptions gOptions;
        public DiBinder(GlobalOptions gOptions)
        {
            this.gOptions = gOptions;
        }

        protected override IServiceProvider GetBoundValue(BindingContext bindingContext)
        {
            var ll = bindingContext.ParseResult.GetValueForOption(gOptions.LogLevel);
            var ff = bindingContext.ParseResult.GetValueForOption(gOptions.ClusterConf);
            string loc = ff?.FullName ?? "cluster_spec.json";
            ClusterSpec? spec = null;
            try
            {
                spec = ClusterSpec.FromJson(File.ReadAllText(loc));
            }
            catch (Exception e)
            {
            }
            return CreateServices(ll, spec);
        }
    }
}