package events

type MultiNodeEventTracker struct {
	individualMatcher EventMatcher
	expectedNodeCount int
	matchedSuccesses  []LogEvent
	matchedFailures   []LogEvent
}

func NewMultiNodeTracker(matcher EventMatcher, nodeCount int) *MultiNodeEventTracker {
	return &MultiNodeEventTracker{
		individualMatcher: matcher,
		expectedNodeCount: nodeCount,
		matchedSuccesses:  []LogEvent{},
		matchedFailures:   []LogEvent{},
	}
}
func (t *MultiNodeEventTracker) GetFailures() []LogEvent {
	return t.matchedFailures
}
func (t *MultiNodeEventTracker) GetMatches() []LogEvent {
	return t.matchedSuccesses
}

func (t *MultiNodeEventTracker) Match(le LogEvent) EventMatchResult {
	mr := t.individualMatcher(le)
	if mr == Match {
		t.matchedSuccesses = append(t.matchedSuccesses, le)
	} else if mr == Abort {
		t.matchedFailures = append(t.matchedFailures, le)
	}
	if len(t.matchedFailures)+len(t.matchedSuccesses) >= t.expectedNodeCount {
		if len(t.matchedFailures) > 0 {
			return Abort
		} else {
			return Match
		}
	}
	return Pass
}
