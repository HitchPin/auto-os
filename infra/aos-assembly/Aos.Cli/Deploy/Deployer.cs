using System.Reflection;
using Aos.Core;
using Aos.DataModel;
using Aos.DataPlane;
using Aos.Core.Graph;
using Aos.PlanarFoundation;
using Microsoft.Extensions.Logging;
using Pulumi.Automation;

namespace Aos.Cli.Deploy;

public class Deployer
{
    private static readonly Type MyType = typeof(Deployer);

    private static readonly MethodInfo DeployStackGenericMethod = MyType
        .GetMethods(BindingFlags.NonPublic | BindingFlags.Instance)
        .Where(m => m.Name.Contains("DeployStackAsync"))
        .First(m => m.GetGenericArguments().Length == 1);
    
    
    private readonly App app;
    private readonly ILogger<Deployer> logger;
    private readonly Dictionary<string, bool> builtYet = new Dictionary<string, bool>();

    public Deployer(
        App app,
        IServiceProvider svc,
        ILogger<Deployer> logger)
    {
        this.app = app;
        this.logger = logger;
        Environment.SetEnvironmentVariable("PULUMI_CONFIG_PASSPHRASE", "");
    }
    
    public async Task DeployAsync(ClusterSpec cs, string[] stackNames)
    {
        if (stackNames == null || stackNames.Length == 0)
        {
            stackNames = app.Stacks.ToArray();
        }
        
        foreach (var sn in stackNames)
        {
            await DeployAsync(cs, sn);
        }
    }
    
    private async Task DeployAsync(ClusterSpec cs, string stackName)
    {
        var s = app.Graph.GetByName(stackName);
        var bo = app.Graph.CreateDeployOrder(s);

        foreach (var b in bo)
        {
            if (builtYet.ContainsKey(b.StackName))
            {
                continue;
            }
            await DeployStackAsync(b, cs);
            builtYet.Add(b.StackName, true);
        }
        
        await DeployStackAsync<DataPlaneStack>(cs);
    }

    private async Task DeployStackAsync(StackRegistration r, ClusterSpec cs)
    {
        var task = (Task)DeployStackGenericMethod.MakeGenericMethod(r.StackType).Invoke(this, new[] { cs });
        await task;
    }

    private async Task DeployStackAsync<T>(ClusterSpec cs) where T : PlanarStack, IPlanarStack
    {
        using var workspace = await LocalWorkspace.CreateAsync(new LocalWorkspaceOptions
        {
            Program = PulumiFn.Create<T>(app.Svc),
            WorkDir = Environment.CurrentDirectory,
            ProjectSettings = new ProjectSettings("aos", ProjectRuntimeName.Dotnet)
            {
            },
            EnvironmentVariables = new Dictionary<string, string?>()
            {
                {"PULUMI_CONFIG_PASSPHRASE", ""},
                {"AWS_REGION", cs.Region},
                {"AWS_PROFILE", "hitchpin"}
            },
            Logger = logger,
            StackSettings = new Dictionary<string, StackSettings>()
            {
                {
                    T.Name, new StackSettings()
                    {
                        
                        Config = new Dictionary<string, StackSettingsConfigValue>()
                        {
                            
                        }
                    }
                }
            },
        });

        Action<string> errorLogger = (s) => logger.LogError(s);
        Action<string> outputLogger = (s) => logger.LogInformation(s);
        
        WorkspaceStack stack;
        try
        {
            stack = await WorkspaceStack.SelectAsync(T.Name, workspace);
        }
        catch (Exception e)
        {
            string finalErrorMessage;
            try
            {
                var stackNames = (await workspace.ListStacksAsync()).Select(s => s.Name).ToList();
                finalErrorMessage =
                    $"Unable to find stack with name '{T.Name}', but found these stacks:\n\t{string.Join(", ", stackNames)}";
            }
            catch (Exception exception)
            {
                finalErrorMessage =
                    $"Unable to find stack with name '{T.Name}'. In addition, could not enumerate any stacks:\n{exception}";
            }

            throw new Exception(finalErrorMessage);
        }
        await stack.SetConfigAsync(ClusterSpec.ConfigKey, new ConfigValue(cs.ToConfigString(), false));
        var r = await stack.UpAsync(new UpOptions
        {
            OnStandardOutput = outputLogger, OnStandardError = errorLogger,
            OnEvent = (e) => logger.LogInformation(e.ToString()),
            LogFlow = true,
        });
        if (r.Summary.Result == UpdateState.Failed)
        {
            throw new Exception("Failed to update stack.");
        }
    }
}