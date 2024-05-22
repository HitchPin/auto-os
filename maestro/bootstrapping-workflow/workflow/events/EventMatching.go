package events

import "time"

type LogEvent struct {
	ShortEventType string
	Timestamp      time.Time              `json:"time"`
	Id             string                 `json:"id"`
	DetailType     string                 `json:"detail-type"`
	Source         string                 `json:"source"`
	Resources      []string               `json:"resources"`
	Detail         map[string]interface{} `json:"detail"`
}
type EventMatchResult string

type EventMatcher func(le LogEvent) EventMatchResult

const (
	Match EventMatchResult = "Match"
	Pass  EventMatchResult = "Pass"
	Abort EventMatchResult = "Abort"
)

func (s *EventMatchResult) IsValid() bool {
	switch *s {
	case Match, Pass, Abort:
		return true
	default:
		return false
	}
}

var EventMatchResults = struct {
	Match EventMatchResult
	Pass  EventMatchResult
	Abort EventMatchResult
}{
	Match: Match,
	Pass:  Pass,
	Abort: Abort,
}
