using System.Collections.Generic;
using Aos.PlanarFoundation;
using Pulumi;
using Pulumi.Aws.Ec2;
using Pulumi.AwsNative.AutoScaling;
using Pulumi.AwsNative.AutoScaling.Inputs;
using Pulumi.AwsNative.Ec2.Inputs;
using Pulumi.AwsNative.Iam;
using InstanceProfile = Pulumi.AwsNative.Iam.InstanceProfile;
using LaunchTemplate = Pulumi.AwsNative.Ec2.LaunchTemplate;
using LaunchTemplateArgs = Pulumi.AwsNative.Ec2.LaunchTemplateArgs;

namespace Aos.DataPlane.Components;

public class NodeAsg : ComponentResource
{
    public NodeAsg(NodeAsgParams pars, ComponentResourceOptions opts)
        : base("autoos:DataPlane:NodeAsg", pars.Spec.Name, opts)
    {
        var spec = pars.ClusterSpec;
        var amis = spec.Versions.Amis;
        var it = GetInstanceType.Invoke(new GetInstanceTypeInvokeArgs()
        {
            InstanceType = pars.Capacity.InstanceType,
        });
        var ami = it.Apply((git =>
            git.SupportedArchitectures.Contains("arm64")
                ? amis.GetArm64Ami(spec.Region)
                : amis.GetX8664Ami(spec.Region)));

        var ip = new InstanceProfile($"{pars.Spec.Name}-InstanceProfile", new InstanceProfileArgs()
        {
            Roles = new InputList<string>() { pars.InstanceRoleArn },
            InstanceProfileName = $"{pars.Spec.Name}-InstanceProfile"
        }, new CustomResourceOptions() { Parent = this });
        var lt = new LaunchTemplate($"{pars.Spec.Name}-Template", new LaunchTemplateArgs()
        {
            LaunchTemplateName = $"{pars.Spec.Name}-Template",
            LaunchTemplateData = new LaunchTemplateDataArgs()
            {
                MetadataOptions = new LaunchTemplateMetadataOptionsArgs()
                {
                    InstanceMetadataTags = "yes",
                    HttpPutResponseHopLimit = 1,
                    HttpTokens = "required"
                },
                SecurityGroupIds = pars.Capacity.CustomSecurityGroupIds ?? pars.NodeSecurityGroupIds,
                ImageId = ami,
                IamInstanceProfile = new LaunchTemplateIamInstanceProfileArgs()
                {
                    Name = ip.InstanceProfileName!,
                },
                UserData = Node.NodeSetupUserDataFactory.Create(this, pars.Spec).Rendered,
                BlockDeviceMappings = new InputList<LaunchTemplateBlockDeviceMappingArgs>()
                {
                    new LaunchTemplateBlockDeviceMappingArgs()
                    {
                        DeviceName = "/dev/xvda",
                        Ebs = new LaunchTemplateEbsArgs()
                        {
                            VolumeSize = 64,
                        }
                    }
                }
            }
        }, new CustomResourceOptions() { Parent = this });

        var asg = new AutoScalingGroup($"{pars.Spec.Name}-ASG", new AutoScalingGroupArgs()
        {
            AutoScalingGroupName = $"{pars.Spec.Name}-ASG",
            VpcZoneIdentifier = pars.Capacity.SubnetIds,
            LaunchTemplate = new AutoScalingGroupLaunchTemplateSpecificationArgs()
            {
                LaunchTemplateId = lt.LaunchTemplateId
            },
            MaxSize = pars.Capacity.MaxCount.ToString(),
            MinSize = pars.Capacity.MinCount.ToString(),
            HealthCheckType = pars.ImmuneFromHealthChecks
                ? "EC2"
                : "ELB",
            HealthCheckGracePeriod = 300
        }, new CustomResourceOptions() { Parent = this });

        this.RegisterOutputs(new Dictionary<string, object?>()
        {
            { "asg", asg },
            { "lauchTemplate", lt },
        });
    }
}