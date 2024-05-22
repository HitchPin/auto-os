package environment

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/service/autoscaling"
	"github.com/pkg/errors"
)

func (rasg RoleAsg) SetDesiredRoleCapacity(desiredCount int) error {
	dc := int32(desiredCount)
	asgClient := autoscaling.NewFromConfig(rasg.conf.Cloud.AwsConf)
	_, err := asgClient.SetDesiredCapacity(context.TODO(), &autoscaling.SetDesiredCapacityInput{
		AutoScalingGroupName: &rasg.Name,
		DesiredCapacity:      &dc,
	})
	if err != nil {
		return errors.Wrap(err, "Failed to update desired capacity count.")
	}
	return nil
}

func (rasg RoleAsg) StartRollingRefresh() error {

	asgClient := autoscaling.NewFromConfig(rasg.conf.Cloud.AwsConf)
	_, err := asgClient.StartInstanceRefresh(context.TODO(), &autoscaling.StartInstanceRefreshInput{
		AutoScalingGroupName: &rasg.Name,
	})
	if err != nil {
		return errors.Wrap(err, "Failed to start rolling refresh.")
	}
	return nil
}
