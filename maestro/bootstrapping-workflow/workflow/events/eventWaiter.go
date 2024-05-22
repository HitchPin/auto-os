package events

import (
	"context"
	"encoding/json"
	"errors"
	"github.com/HitchPin/maestro/common/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatchlogs"
	cwTypes "github.com/aws/aws-sdk-go-v2/service/cloudwatchlogs/types"
	"github.com/pterm/pterm"
	"log"
)

type LogLineHandler func(le LogEvent)

func WaitForEventCondition(awsConf aws.Config, logGroupName string, matcher EventMatcher) (*LogEvent, error) {

	client := cloudwatchlogs.NewFromConfig(awsConf)
	request := &cloudwatchlogs.StartLiveTailInput{
		LogGroupIdentifiers: []string{
			logGroupName,
		},
	}
	response, err := client.StartLiveTail(context.TODO(), request)
	if err != nil {
		log.Fatalf("Failed to start streaming: %v", err)
		return nil, err
	}

	logger := pterm.DefaultLogger.WithLevel(pterm.LogLevelTrace)

	stream := response.GetStream()
	eventsChan := stream.Events()
	for {
		event := <-eventsChan
		switch e := event.(type) {
		case *cwTypes.StartLiveTailResponseStreamMemberSessionStart:
			continue
		case *cwTypes.StartLiveTailResponseStreamMemberSessionUpdate:
			for _, logEvent := range e.Value.SessionResults {
				msgBytes := []byte(*logEvent.Message)
				var le LogEvent
				err := json.Unmarshal(msgBytes, &le)
				if err != nil {
					continue
				}

				shortName, _ := events.EventShortNames[le.DetailType]
				le.ShortEventType = shortName

				le.Log(logger)
				matchResult := matcher(le)
				logger.Info("Result:", logger.ArgsFromMap(map[string]any{
					"result": matchResult,
				}))
				switch matchResult {
				case EventMatchResults.Pass:
					continue
				case EventMatchResults.Abort:
					stream.Close()
					return nil, errors.New("Got abort result from matcher for event.")

				case EventMatchResults.Match:
					stream.Close()
					return &le, nil
				}
			}
		default:
			// Handle on-stream exceptions
			if err := stream.Err(); err != nil {
				log.Fatalf("Error occured during streaming: %v", err)
			} else if event == nil {
				log.Println("Stream is Closed")
				return nil, errors.New("Stream is Closed")
			} else {
				log.Fatalf("Unknown event type: %T", e)
			}
		}
	}
}
