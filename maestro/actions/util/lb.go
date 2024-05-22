package util

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/elasticloadbalancingv2"
	"github.com/pkg/errors"
)

func GetDnsNameForLb(awsConf aws.Config, lbName string) (*string, error) {
	elbv2 := elasticloadbalancingv2.NewFromConfig(awsConf)
	res, err := elbv2.DescribeLoadBalancers(context.TODO(), &elasticloadbalancingv2.DescribeLoadBalancersInput{
		Names: []string{lbName},
	})
	if err != nil {
		return nil, err
	}
	if len(res.LoadBalancers) == 0 {
		return nil, errors.New("No load balancers found.")
	}
	lb := res.LoadBalancers[0]
	return lb.DNSName, nil
}
