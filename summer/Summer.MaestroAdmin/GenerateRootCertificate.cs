using System.IO;
using System.Linq;
using Pulumi;
using Pulumi.Command.Local;

namespace Summer.MaestroAdmin;

public class GenerateRootCertificate : ComponentResource
{
    public GenerateRootCertificate(string name, GenerateRootCertificateArgs args, ComponentResourceOptions? options)
    : base("AutoOs::Maestro::RootCertificate", name)
    {
        var tmp = Path.GetTempFileName() + ".pem";
        var certTask = MaestroCliUtil.NewRootCertificateCmd(
            args.Organization, args.Country, args.State, args.City, tmp);
        var cmd = new Command("Cmd", new CommandArgs()
        {
            Create = certTask,
            AssetPaths = "*.pem"
        }, new CustomResourceOptions() { Parent = this });

        /*
         * 
           var result = await Cli.Wrap(loc)
               .WithArguments(.Split(' '))
               .WithEnvironmentVariables(b => b.Set(env).Build())
               .WithStandardOutputPipe(PipeTarget.ToDelegate((s) => logger.LogInformation(s)))
               .WithStandardErrorPipe(PipeTarget.ToDelegate((s) => logger.LogError(s)))
               .ExecuteAsync();
           if (!result.IsSuccess)
           {
               throw new ArgumentException("Processes exited with non-zero exit code: {result.ExitCode}");
           }

           return X509Certificate2.CreateFromPemFile(tmp, null);
         */

        this.Certificate = cmd.Assets
            .Apply(a => a.First().Value)
            .Apply(a => a.ToString());
    }
    
    [Output]
    public Output<string> Certificate { get; set; }
}