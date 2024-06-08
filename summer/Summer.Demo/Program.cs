using Microsoft.Extensions.Logging;
using Summer.Core;
using Summer.Demo;

using var loggerFactory = LoggerFactory.Create(loggingBuilder => loggingBuilder
    .SetMinimumLevel(LogLevel.Trace)
    .AddConsole());

var stack = new AppBuilder<SummerId>()
    .RegisterStack<SimpleSeason>()
    .Build(new SummerId("HpBeta", "1234"));

var deployer = new Deployer<SummerId>(stack, new EnvironmentSettings()
{
    Region = "us-east-2",
    CredentialProfile = "hp-johnathan"
}, loggerFactory.CreateLogger<Deployer<SummerId>>());

await deployer.DeployStackAsync<SimpleSeason>("Simple");


/*
var awsRegion = "us-east-2";
var envVars = new Dictionary<string, string?>()
{
    { "PULUMI_CONFIG_PASSPHRASE", "" },
    { "AWS_REGION", awsRegion },
    { "AWS_PROFILE", "hp-johnathan" },
};

var logger = loggerFactory.CreateLogger<Program>();
var stackName = "DemoStack";

using var workspace = await LocalWorkspace.CreateAsync(new LocalWorkspaceOptions
{
    Program = PulumiFn.Create<SimpleStack>(),
    WorkDir = Environment.CurrentDirectory,
    ProjectSettings = new ProjectSettings("Demo", ProjectRuntimeName.Dotnet)
    {
    },
    EnvironmentVariables = envVars,
    Logger = loggerFactory.CreateLogger<LocalWorkspace>(),
    StackSettings = new Dictionary<string, StackSettings>()
    {
        {
            stackName, new StackSettings()
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
    stack = await WorkspaceStack.SelectAsync(stackName, workspace);
}
catch (Exception e)
{
    try
    {
        await workspace.CreateStackAsync(stackName);
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
            $"Unable to find stack with name '{stackName}', but found these stacks:\n\t{string.Join(", ", stackNames)}";
    }
    catch (Exception exception)
    {
        finalErrorMessage =
            $"Unable to find stack with name '{stackName}'. In addition, could not enumerate any stacks:\n{exception}";
    }

    throw new Exception(finalErrorMessage);
}

await stack.SetConfigAsync("aws:region", new ConfigValue(awsRegion));
await stack.SetConfigAsync("aws-native:region", new ConfigValue(awsRegion));
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
*/