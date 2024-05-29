using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Pulumi;

namespace Summer.Environment;

public class Summertime
{
    private static readonly ThreadLocal<Summertime?> _summertimes = new ThreadLocal<Summertime?>();
    
    private Dictionary<string, IEnvProvider> tokenProviders = new Dictionary<string, IEnvProvider>();

    public static void RegisterProvider<T>() where T : IEnvProvider => _summertimes.Value.RegisterProviderInstance<T>();
    public static void RegisterProvider<T>(T instance) where T : IEnvProvider => _summertimes.Value.RegisterProviderInstance<T>(instance);

    public void RegisterProviderInstance<T>() where T : IEnvProvider => RegisterProvider(Activator.CreateInstance<T>());
    public void RegisterProviderInstance<T>(T instance) where T: IEnvProvider
    {
        foreach (var k in instance.Keys)
        {
            if (tokenProviders.ContainsKey(k))
            {
                throw new ArgumentException($"Token key '{k}' already found.");
            }
        }

        foreach (var k in instance.Keys)
        {
            tokenProviders.Add(k, instance);
        }
    }

    public static async Task<T> ResolveFromEnvironmentAsync<T>(Token<T> token)
    {
        return await _summertimes!.Value.ResolveTokenFromEnvironmentAsync(token);
    }
    public static Output<T> ResolveFromEnvironment<T>(Token<T> token)
    {
        return _summertimes!.Value.ResolveTokenFromEnvironment(token);
    }

    public async Task<T> ResolveTokenFromEnvironmentAsync<T>(Token<T> token)
    {
        if (!tokenProviders.ContainsKey(token.key))
        {
            throw new ArgumentException($"No known provider for key '{token.key}'.");
        }

        var provider = tokenProviders[token.key];
        return await provider.ResolveTokenAsync(token);
    }
    public Output<T> ResolveTokenFromEnvironment<T>(Token<T> token)
    {
        if (!tokenProviders.ContainsKey(token.key))
        {
            throw new ArgumentException($"No known provider for key '{token.key}'.");
        }

        var provider = tokenProviders[token.key];
        return provider.ResolveToken(token);
    }

    public static async Task RestartAsync()
    {
        if (_summertimes.Value != null)
        {
            await StopAsync();
        }

        await StartAsync();
    }
    public static async Task StartAsync()
    {
        if (_summertimes.Value != null)
        {
            throw new ArgumentException("Already started!");
        }
        _summertimes.Value = new Summertime();
    }

    public static async Task StopAsync()
    {
        if (_summertimes.Value == null)
        {
            throw new ArgumentException("Not started started!");
        }

        _summertimes.Value = null;
    }
}