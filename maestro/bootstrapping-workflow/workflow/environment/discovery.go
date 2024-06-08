package environment

import (
	"context"
	"github.com/HitchPin/maestro/bootstrapping-workflow/builders"
	"github.com/HitchPin/maestro/bootstrapping-workflow/configuration"
	"github.com/aws/aws-sdk-go-v2/service/autoscaling"
	asgTypes "github.com/aws/aws-sdk-go-v2/service/autoscaling/types"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
	"strings"
)

func DiscoverEnvironment(exConf configuration.ExecutionConfiguration) (*DiscoveredEnvironment, error) {
	envConf := &DiscoveredEnvironment{
		conf: exConf,
	}

	envConf.AsgsByRole = discoverRoleAsgs(exConf)

	return envConf, nil
}

func discoverRoleAsgs(exConf configuration.ExecutionConfiguration) RoleAsgs {

	asgDiscovery := builders.NewAsgDiscovery(*autoscaling.NewFromConfig(exConf.Cloud.AwsConf), exConf.GetClusterName())

	asgs := asgDiscovery.
		Query().
		HasTag("Role").
		HasTagWithValue("Cluster", exConf.GetClusterName()).
		Search()

	asgsByRole := map[string]asgTypes.AutoScalingGroup{}
	for _, asg := range asgs {
		asgRole := getTagValFromAsgByTagKey(asg, "Role")
		asgsByRole[*asgRole] = asg
	}

	roleAsgs := RoleAsgs{}
	if bootstrapAsg, ok := asgsByRole["bootstrapper"]; ok {
		roleAsgs.Bootstrapping = &*asgToRoleAsg(exConf, bootstrapAsg)
	}
	if dataAsg, ok := asgsByRole["data"]; ok {
		roleAsgs.Data = &*asgToRoleAsg(exConf, dataAsg)
	}
	if cmAsg, ok := asgsByRole["cluster_manager"]; ok {
		roleAsgs.ClusterManager = &*asgToRoleAsg(exConf, cmAsg)
	}
	if ingestAsg, ok := asgsByRole["ingest"]; ok {
		roleAsgs.Ingest = &*asgToRoleAsg(exConf, ingestAsg)
	}
	if mlAsg, ok := asgsByRole["ml"]; ok {
		roleAsgs.ML = &*asgToRoleAsg(exConf, mlAsg)
	}
	if coordAsg, ok := asgsByRole["coordinator"]; ok {
		roleAsgs.Coordinator = &*asgToRoleAsg(exConf, coordAsg)
	}
	if searchAsg, ok := asgsByRole["search"]; ok {
		roleAsgs.Search = &*asgToRoleAsg(exConf, searchAsg)
	}

	roleAsgs.conf = exConf
	return roleAsgs
}

func getTagValFromAsgByTagKey(asg asgTypes.AutoScalingGroup, tagKey string) *string {
	for _, t := range asg.Tags {
		if *t.Key == tagKey {
			return t.Value
		}
	}
	return nil
}

func asgToRoleAsg(exConf configuration.ExecutionConfiguration, asg asgTypes.AutoScalingGroup) *RoleAsg {
	auxInfo, err := getAmiAndInstanceType(exConf, asg)
	if err != nil {
		panic(err)
	}
	return &RoleAsg{
		conf:           exConf,
		Role:           *getTagValFromAsgByTagKey(asg, "Role"),
		Name:           *asg.AutoScalingGroupName,
		CurCapacity:    int(*asg.DesiredCapacity),
		MinCapacity:    int(*asg.MinSize),
		MaxCapacity:    int(*asg.MaxSize),
		ActualCapacity: len(asg.Instances),
		ExposedToLb:    *asg.HealthCheckType == "ELB",
		InstanceType:   auxInfo.InstanceType,
		AmiId:          auxInfo.AmiId,
		AmiName:        auxInfo.AmiName,
	}
}

type AsgLaunchTemplateDetails struct {
	AmiId        string
	AmiName      string
	InstanceType string
}

func getAmiAndInstanceType(exConf configuration.ExecutionConfiguration, asg asgTypes.AutoScalingGroup) (*AsgLaunchTemplateDetails, error) {

	ec2client := ec2.NewFromConfig(exConf.Cloud.AwsConf)
	res, err := ec2client.DescribeLaunchTemplateVersions(context.TODO(), &ec2.DescribeLaunchTemplateVersionsInput{
		LaunchTemplateId: asg.LaunchTemplate.LaunchTemplateId,
		Versions:         []string{*asg.LaunchTemplate.Version},
	})
	if err != nil {
		return nil, err
	}

	lv := res.LaunchTemplateVersions[0]
	amiId := lv.LaunchTemplateData.ImageId

	if strings.HasPrefix(*amiId, "resolve:ssm:") {
		paramName, _ := strings.CutPrefix(*amiId, "resolve:ssm:")
		ssmClient := ssm.NewFromConfig(exConf.Cloud.AwsConf)
		paramRes, err := ssmClient.GetParameter(context.TODO(), &ssm.GetParameterInput{
			Name: &paramName,
		})
		if err != nil {
			return nil, err
		}
		amiId = paramRes.Parameter.Value
	}

	amiRes, err := ec2client.DescribeImages(context.TODO(), &ec2.DescribeImagesInput{
		ImageIds: []string{*amiId},
	})
	amiData := amiRes.Images[0]

	aux := AsgLaunchTemplateDetails{
		InstanceType: string(lv.LaunchTemplateData.InstanceType),
		AmiName:      *amiData.Name,
		AmiId:        *amiData.ImageId,
	}
	return &aux, nil
}
