using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Pulumi.Automation;
using Summer.Core.Cloud;
using Summer.Core.Graph;

namespace Summer.Core;

public class Deployer<TAppId> where TAppId : IAppIdentifier
{
    private static readonly Type MyType = typeof(Deployer<TAppId>);

    private static readonly MethodInfo DeployStackGenericMethod = MyType
        .GetMethods(BindingFlags.NonPublic | BindingFlags.Instance)
        .Where(m => m.Name.Contains("DeployStackAsync"))
        .First(m => m.GetGenericArguments().Length == 1);
    
    
    private readonly App<TAppId> app;
    private readonly EnvironmentSettings settings;
    private readonly ILogger<Deployer<TAppId>> logger;
    private readonly Dictionary<string, bool> builtYet = new Dictionary<string, bool>();

    public Deployer(
        App<TAppId> app,
        EnvironmentSettings settings,
        ILogger<Deployer<TAppId>> logger)
    {
        this.app = app;
        this.logger = logger;
        this.settings = settings;
        Environment.SetEnvironmentVariable("PULUMI_CONFIG_PASSPHRASE", "");
    }
    
    public async Task DeployNamedStacksAsync(string[] stackNames)
    {
        if (stackNames == null || stackNames.Length == 0)
        {
            stackNames = app.Stacks.ToArray();
        }
        
        foreach (var sn in stackNames)
        {
            await DeployStackByName(sn);
        }
    }
    
    public async Task DeployStackByName(string stackName)
    {
        var s = app.Graph.GetByName(stackName);
        var bo = app.Graph.CreateDeployOrder(s);

        foreach (var b in bo)
        {
            if (builtYet.ContainsKey(b.StackName))
            {
                continue;
            }
            await DeployStackAsync(b, stackName);
            builtYet.Add(b.StackName, true);
        }
    }

    private async Task DeployStackAsync(StackRegistration r, string stackIdentifier)
    {
        var task = (Task)DeployStackGenericMethod.MakeGenericMethod(r.StackType)!.Invoke(this, new[]
        {
            (object)this.app.Id,
            stackIdentifier
        })!;
        await task;
    }

    public async Task DeployStackAsync<T>(string stackIdentifier) where T : Season<TAppId>
    {
        var svc = (ServiceProvider)app.Svc;
        var originalCollection = svc.GetRequiredService<IServiceCollection>();
        originalCollection.AddSingleton<PulumiWrappedStack<TAppId, T>>();
        originalCollection.AddSingleton<App<TAppId>>(app);
        originalCollection.AddSingleton<string>(stackIdentifier);
        var added = originalCollection.BuildServiceProvider();

        var envVars = new Dictionary<string, string?>()
        {
            { "PULUMI_CONFIG_PASSPHRASE", "" },
            { "AWS_REGION", settings.Region },
        };
        if (!string.IsNullOrEmpty(settings.CredentialProfile))
        {
            envVars.Add("AWS_PROFILE", settings.CredentialProfile!);
        }
        using var workspace = await LocalWorkspace.CreateAsync(new LocalWorkspaceOptions
        {
            Program = PulumiFn.Create<PulumiWrappedStack<TAppId, T>>(added),
            WorkDir = Environment.CurrentDirectory,
            ProjectSettings = new ProjectSettings(app.Id.TitlePrefix, ProjectRuntimeName.Dotnet)
            {
            },
            EnvironmentVariables = envVars,
            Logger = logger,
            StackSettings = new Dictionary<string, StackSettings>()
            {
                {
                    stackIdentifier, new StackSettings()
                    {
                        
                        Config = new Dictionary<string, StackSettingsConfigValue>()
                        {
                            
                        }
                    }
                }
            },
        });
        await workspace.InstallPluginAsync("aws", "6.37.1", PluginKind.Resource);
        logger.LogInformation("");
        await workspace.InstallPluginAsync("aws-native", "0.107.0", PluginKind.Resource);
        
        Action<string> errorLogger = (s) => logger.LogError(s);
        Action<string> outputLogger = (s) => logger.LogInformation(s);
        
        goAgain:
        WorkspaceStack stack;
        try
        {
            stack = await WorkspaceStack.SelectAsync(stackIdentifier, workspace);
        }
        catch (Exception e)
        {
            try
            {
                await workspace.CreateStackAsync(stackIdentifier);
                goto goAgain;
            }
            catch (Exception exception)
            {
            }
            string finalErrorMessage;
            try
            {
                var stackNames = (await workspace.ListStacksAsync()).Select(s => s.Name).ToList();
                finalErrorMessage =
                    $"Unable to find stack with name '{stackIdentifier}', but found these stacks:\n\t{string.Join(", ", stackNames)}";
            }
            catch (Exception exception)
            {
                finalErrorMessage =
                    $"Unable to find stack with name '{stackIdentifier}'. In addition, could not enumerate any stacks:\n{exception}";
            }

            throw new Exception(finalErrorMessage);
        }
        
        await stack.SetConfigAsync("aws:region", new ConfigValue(settings.Region));
        await stack.SetConfigAsync("aws-native:region", new ConfigValue(settings.Region));
        var r = await stack.UpAsync(new UpOptions
        {
            OnStandardOutput = outputLogger, OnStandardError = errorLogger,
            OnEvent = (e) => logger.LogInformation(e.ToString()),
            LogFlow = true,
            ContinueOnError = false,
        });
        if (r.Summary.Result == UpdateState.Failed)
        {
            throw new Exception("Failed to update stack.");
        }
    }
}