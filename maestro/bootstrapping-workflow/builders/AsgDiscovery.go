package builders

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/service/autoscaling"
	asgTypes "github.com/aws/aws-sdk-go-v2/service/autoscaling/types"
	"github.com/pkg/errors"
)

type AsgDiscovery struct {
	asgClient   autoscaling.Client
	clusterName string
}

func NewAsgDiscovery(asgClient autoscaling.Client, clusterName string) AsgDiscovery {
	return AsgDiscovery{
		asgClient:   asgClient,
		clusterName: clusterName,
	}
}

func (ad AsgDiscovery) Query() AsgQuery {
	return AsgQuery{
		asgDisco: ad,
		filters:  []asgTypes.Filter{},
	}
}

type AsgQuery struct {
	asgDisco AsgDiscovery
	filters  []asgTypes.Filter
}

func (query AsgQuery) HasTag(tagName string) AsgQuery {
	kfName := "tag-key"
	filter := asgTypes.Filter{
		Name:   &kfName,
		Values: []string{tagName},
	}
	newFilters := append(query.filters, filter)
	return AsgQuery{
		asgDisco: query.asgDisco,
		filters:  newFilters,
	}
}
func (query AsgQuery) HasTagWithValue(tagName string, tagValue string) AsgQuery {
	kfName := fmt.Sprintf("tag:%s", tagName)
	filter := asgTypes.Filter{
		Name:   &kfName,
		Values: []string{tagValue},
	}
	newFilters := append(query.filters, filter)
	return AsgQuery{
		asgDisco: query.asgDisco,
		filters:  newFilters,
	}
}

func (query AsgQuery) Search() []asgTypes.AutoScalingGroup {
	asgClient := query.asgDisco.asgClient
	req := autoscaling.DescribeAutoScalingGroupsInput{
		Filters: query.filters,
	}
	asgResult, err := asgClient.DescribeAutoScalingGroups(context.TODO(), &req)
	if err != nil {
		panic(errors.Wrap(err, "Unable to describe auto scaling groups with provided filters."))
	}
	return asgResult.AutoScalingGroups
}
