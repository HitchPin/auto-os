package util

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/HitchPin/maestro/common/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/eventbridge"
	ebTypes "github.com/aws/aws-sdk-go-v2/service/eventbridge/types"
)

/*
	type AdminCertIssuedEventDetails struct {
		DistinguishedName string
		ForClientUse      string
		ForServerUse      string
		KeySize           int
	}

	type CertIssuedEventDetails struct {
		DistinguishedName string
		AlternateNames    []string
		ForClientUse      string
		ForServerUse      string
		KeySize           int
	}
*/

const EventSrc = "maestro"

type DiscoInfo struct {
	NamespaceName string `json:"namespace"`
	ServiceName   string `json:"service-name"`
	Instance      string `json:"instance-id"`
	OperationId   string `json:"operation-id"`
}
type NodeDiscoRegistrationEventDetails struct {
	ClusterName        string    `json:"cluster-name"`
	NodeName           string    `json:"node-name"`
	MaestroRole        string    `json:"maestro-role"`
	CapacityType       string    `json:"capacity-type"`
	CapacityInstanceId string    `json:"capacity-instance-id"`
	Disco              DiscoInfo `json:"disco"`
}
type NodeInitFailureEventDetails struct {
	ClusterName        string `json:"cluster-name"`
	NodeName           string `json:"node-name"`
	MaestroRole        string `json:"maestro-role"`
	CapacityType       string `json:"capacity-type"`
	CapacityInstanceId string `json:"capacity-instance-id"`
	DebugMessage       string `json:"debug-message"`
}

func PublishNodeInitFailureEvent(awsConf aws.Config, eventBus string, details NodeInitFailureEventDetails) (*string, error) {
	detailBytes, err := json.Marshal(details)
	if err != nil {
		return nil, err
	}
	return putEventWithDetail(awsConf, eventBus, events.NodeInitFailed, string(detailBytes))
}
func PublishNodeDiscoRegistrationEvent(awsConf aws.Config, eventBus string, details NodeDiscoRegistrationEventDetails) (*string, error) {
	detailBytes, err := json.Marshal(details)
	if err != nil {
		return nil, err
	}
	return putEventWithDetail(awsConf, eventBus, events.NodeInitializedAndRegistered, string(detailBytes))
}

func putEventWithDetail(awsConf aws.Config, eventBus string, eventType string, details string) (*string, error) {

	eb := eventbridge.NewFromConfig(awsConf)

	src := EventSrc

	res, err := eb.PutEvents(context.TODO(), &eventbridge.PutEventsInput{
		Entries: []ebTypes.PutEventsRequestEntry{
			{
				EventBusName: &eventBus,
				Source:       &src,
				DetailType:   &eventType,
				Detail:       &details,
			},
		},
	})
	if err != nil {
		return nil, err
	}
	return handleResponse(*res)
}

func handleResponse(res eventbridge.PutEventsOutput) (*string, error) {
	eventIds := []string{}
	for _, e := range res.Entries {
		if e.ErrorCode != nil {
			return nil, errors.New(fmt.Sprintf("Failed to publish event with error code %s. %s.", *e.ErrorCode, *e.ErrorMessage))
		}
		eventIds = append(eventIds, *e.EventId)
	}
	fmt.Printf("Published event with ids: %s.\n", eventIds)
	if len(eventIds) > 0 {
		eid := eventIds[0]
		return &eid, nil
	}
	return nil, nil
}
