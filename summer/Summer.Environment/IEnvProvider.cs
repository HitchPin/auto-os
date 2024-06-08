using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Pulumi;

namespace Summer.Environment;

public interface IEnvProvider
{
    string[] Keys { get; }
    Output<T> ResolveToken<T>(Token<T> asdf);
    Task<T> ResolveTokenAsync<T>(Token<T> asdf);
}