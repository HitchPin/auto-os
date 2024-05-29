using System.Collections.Immutable;
using System.Linq;
using Pulumi.CloudInit.Inputs;

namespace Aos.DataPlane.Components.Node;

public record CloudInitBuilder
{
    public ImmutableList<ConfigPartArgs> Parts { get; private init; } = ImmutableList.Create<ConfigPartArgs>();

    public CloudInitBuilder WithScript(string name ,string script)
    {
        return this with
        {
            Parts = Parts.Add(new ConfigPartArgs
            {
                Content = script,
                ContentType = "text/x-shellscript",
                Filename = name
            })
        };
    }

    public Pulumi.CloudInit.ConfigArgs Build()
    {
        return new Pulumi.CloudInit.ConfigArgs
        {
            Gzip = true,
            Base64Encode = false,
            Parts = this.Parts.ToList()
        };
    }

    public record SetHostnameArgs(
        bool PreserveHostname,
        string Hostname,
        string Fqdn,
        bool PreferFqdnOverHostname,
        bool CreateHostnameFile);
    public CloudInitBuilder WithSetHostname(SetHostnameArgs args)
    {
        string yaml =
            $"""
            preserve_hostname: {args.PreserveHostname}
            hostname: {args.Hostname}
            create_hostname_file: {args.CreateHostnameFile}
            fqdn: {args.Fqdn}
            prefer_fqdn_over_hostname: {args.PreferFqdnOverHostname}
            """;
        return this with
        {
            Parts = Parts.Add(new ConfigPartArgs
            {
                Content = yaml,
                ContentType = "text/cloud-config",
                Filename = "cc_set_hostname"
            })
        };
    }
}