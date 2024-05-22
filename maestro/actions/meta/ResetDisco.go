package meta

import (
	"context"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/aws/aws-sdk-go-v2/service/servicediscovery"
)

type ResetDiscoInput struct {
	CommonProps util.CommonProps
}
type ResetDiscoOutput struct {
	RemovedCount int
}

func ResetDisco(input ResetDiscoInput) (*ResetDiscoOutput, error) {

	srv := servicediscovery.NewFromConfig(input.CommonProps.AwsConf)
	res, err := srv.ListInstances(context.TODO(), &servicediscovery.ListInstancesInput{
		ServiceId: &input.CommonProps.DiscoveryServiceId,
	})
	if err != nil {
		return nil, err
	}

	total := 0
	for _, i := range res.Instances {
		_, err := srv.DeregisterInstance(context.TODO(), &servicediscovery.DeregisterInstanceInput{
			ServiceId:  &input.CommonProps.DiscoveryServiceId,
			InstanceId: i.Id,
		})
		if err != nil {
			return nil, err
		}
		total = total + 1
	}

	r := ResetDiscoOutput{
		RemovedCount: total,
	}

	return &r, nil
}
