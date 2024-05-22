package meta

import (
	"context"
	"fmt"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	ec2types "github.com/aws/aws-sdk-go-v2/service/ec2/types"
	"github.com/aws/aws-sdk-go-v2/service/servicediscovery"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
	"github.com/pkg/errors"
)

type RegisterInstanceInput struct {
	CommonParams util.CommonProps
	InstanceId   string
}
type RegisterInstanceOutput struct {
	RegistrationId string
}

func RegisterInstance(input RegisterInstanceInput) (*RegisterInstanceOutput, error) {

	ec2Client := ec2.NewFromConfig(input.CommonParams.AwsConf)
	discoveryClient := servicediscovery.NewFromConfig(input.CommonParams.AwsConf)
	clusterName, err := getClusterName(input.CommonParams.AwsConf, input.CommonParams.ClusterNameParameterId)
	if err != nil {
		return nil, err
	}

	instance, err := getInstance(*ec2Client, input.InstanceId)
	if err != nil {
		return nil, err
	}
	role := getRoleTag(*instance)
	if role == nil {
		return nil, errors.New(fmt.Sprintf("Instance %s is missing a 'Role' tag.", input.InstanceId))
	}
	fmt.Printf("Found instance id %s has cluster role %s.", input.InstanceId, *role)

	ip := *instance.NetworkInterfaces[0].PrivateIpAddress
	hostname := *instance.PrivateDnsName

	res, err := discoveryClient.RegisterInstance(context.TODO(), &servicediscovery.RegisterInstanceInput{
		ServiceId:  &input.CommonParams.DiscoveryServiceId,
		InstanceId: &input.InstanceId,
		Attributes: map[string]string{
			"Role":              *role,
			"Cluster":           *clusterName,
			"Hostname":          hostname,
			"AWS_INSTANCE_IPV4": ip,
		},
	})
	if err != nil {
		return nil, errors.Wrap(err, "Failed to register instance.")
	}

	_, err = util.PublishNodeDiscoRegistrationEvent(input.CommonParams.AwsConf, input.CommonParams.EventBusName, util.NodeDiscoRegistrationEventDetails{
		ClusterName:        *clusterName,
		NodeName:           input.InstanceId,
		MaestroRole:        *role,
		CapacityType:       "ec2",
		CapacityInstanceId: input.InstanceId,
		Disco: util.DiscoInfo{
			NamespaceName: input.CommonParams.DiscoveryNamespaceName,
			ServiceName:   input.CommonParams.DiscoveryServiceName,
			Instance:      input.InstanceId,
			OperationId:   *res.OperationId,
		},
	})
	if err != nil {
		return nil, errors.Wrap(err, "Failed to publish event.")
	}

	return &RegisterInstanceOutput{
		RegistrationId: *res.OperationId,
	}, nil
}

func getClusterName(conf aws.Config, paramName string) (*string, error) {
	ssmClient := ssm.NewFromConfig(conf)
	res, err := ssmClient.GetParameter(context.TODO(), &ssm.GetParameterInput{
		Name: &paramName,
	})
	if err != nil {
		return nil, err
	}
	return res.Parameter.Value, nil
}

func getRoleTag(i ec2types.Instance) *string {
	for _, t := range i.Tags {
		if *t.Key == "Role" {
			return t.Value
		}
	}
	return nil
}

func getInstance(ec2Client ec2.Client, instanceId string) (*ec2types.Instance, error) {
	instanceRes, err := ec2Client.DescribeInstances(context.TODO(), &ec2.DescribeInstancesInput{
		InstanceIds: []string{instanceId},
	})

	if err != nil {
		return nil, err
	}
	if instanceRes.Reservations == nil || len(instanceRes.Reservations) == 0 {
		return nil, errors.New(fmt.Sprintf("No matching instances found for instance id %s.", instanceId))
	}
	reservation := instanceRes.Reservations[0]
	if len(reservation.Instances) == 0 {
		return nil, errors.New(fmt.Sprintf("No matching instances found for instance id %s.", instanceId))
	}

	return &reservation.Instances[0], nil
}
