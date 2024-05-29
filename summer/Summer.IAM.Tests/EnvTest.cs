using Summer.Environment;
using Summer.Testing;

namespace Summer.IAM.Tests;

public abstract class EnvTest : IDisposable
{
    private readonly TestEnvProvider _testEnvProvider;
    public EnvTest()
    {
        Summertime.RestartAsync().GetAwaiter().GetResult();
        var i = new TestEnvProvider();
        Summertime.RegisterProvider<TestEnvProvider>(i);
        this._testEnvProvider = i;
    }

    protected TestEnvProvider TestEnv => _testEnvProvider;

    public void Dispose()
    {
        Summertime.StopAsync().GetAwaiter().GetResult();
    }
}