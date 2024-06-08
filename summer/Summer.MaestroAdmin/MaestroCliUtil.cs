using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Bazel;
using CliWrap;
using Microsoft.Extensions.Logging;
using Env = Summer.Environment;

namespace Summer.MaestroAdmin;

public class MaestroCliUtil
{
    public static string NewRootCertificateCmd(string org, string country, string state, string city, string file)
    {
        var logger = Env.Summertime.CreateLogger<MaestroCliUtil>();
        var (rf, loc) = GetLocation();
        var env = rf.GetEnvVars();

        return loc + $"certs new-root --org {org} --country {country} --state {state} --city {city} -o {file}";
            
    }
    private static (Runfiles, string) GetLocation()
    {
        var envs = new Dictionary<string, string>();
        foreach (var k in System.Environment.GetEnvironmentVariables().Keys)
        {
            envs.Add((string)k, System.Environment.GetEnvironmentVariable((string)k!)!);
        }
        envs.Add("RUNFILES_MANIFEST_ONLY", "1");
        var rf = Bazel.Runfiles.Create(System.Environment.GetCommandLineArgs().FirstOrDefault(), envs);
        var loc = rf.Rlocation("_main/maestro/admin-cli/admin-cli_/admin-cli");
        return (rf, loc);
    }
}