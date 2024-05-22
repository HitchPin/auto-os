package events

import (
	"fmt"
	"github.com/HitchPin/maestro/common/events"
	"github.com/pterm/pterm"
	"strings"
)

type LogEventLogger func(logger *pterm.Logger, le LogEvent)

var DetailTypeRenderers = map[string]LogEventLogger{
	"ClusterManagerChanged":     clusterManagerChangedRenderer,
	"NodeJoinedCluster":         nodeJoinedRenderer,
	"NodeLeftCluster":           nodeLeftRenderer,
	"ClusterHealthStateChanged": clusterHealthChangedRenderer,
	"NodeCapacityLaunched":      capLaunchedRenderer,
}

func fallbackLogEventRenderer(logger *pterm.Logger, le LogEvent) {
	shortName := events.EventShortNames[le.DetailType]
	fm := fmt.Sprintf("'%s' event reported by %s.",
		shortName,
		le.Source)
	logger.Debug(fm)
}

func (le LogEvent) Log(logger *pterm.Logger) {

	shortName, ok := events.EventShortNames[le.DetailType]
	if !ok {
		return
	}
	renderer, ok := DetailTypeRenderers[shortName]
	if !ok {
		fallbackLogEventRenderer(logger, le)
	} else {
		renderer(logger, le)
	}
}

func clusterManagerChangedRenderer(logger *pterm.Logger, le LogEvent) {
	nodeName := le.Detail["node-name"]
	fm := fmt.Sprintf("👑 '%s' has become the leader of the cluster.",
		nodeName)

	auxillary := logger.ArgsFromMap(map[string]any{
		"Node Name":         le.Detail["node-name"],
		"Node Id":           le.Detail["node-id"],
		"IP Address":        le.Detail["ip-address"],
		"Availability Zone": le.Detail["zone"],
	})
	logger.Info(fm, auxillary)
}

func nodeJoinedRenderer(logger *pterm.Logger, le LogEvent) {
	nodeName := le.Detail["node-name"]
	fm := fmt.Sprintf("'%s' joined the cluster.",
		nodeName)

	auxillary := logger.ArgsFromMap(map[string]any{
		"Node Name": nodeName,
	})
	logger.Warn(fm, auxillary)
}

func nodeLeftRenderer(logger *pterm.Logger, le LogEvent) {
	nodeName := le.Detail["node-name"]
	fm := fmt.Sprintf("'%s' left the cluster.",
		nodeName)

	auxillary := logger.ArgsFromMap(map[string]any{
		"Node Name": nodeName,
	})
	logger.Warn(fm, auxillary)
}

func clusterHealthChangedRenderer(logger *pterm.Logger, le LogEvent) {
	oldVal := strings.ToUpper(le.Detail["old-value"].(string))
	newVal := strings.ToUpper(le.Detail["new-value"].(string))
	fm := fmt.Sprintf("Cluster status changed from %s to %s.",
		oldVal, newVal)

	auxillary := logger.ArgsFromMap(map[string]any{
		"Old Value": oldVal,
		"New Value": newVal,
	})

	if newVal == "RED" {
		logger.Error(fm, auxillary)
	} else if newVal == "YELLOW" {
		logger.Warn(fm, auxillary)
	} else {
		logger.Debug(fm, auxillary)
	}
}

func capLaunchedRenderer(logger *pterm.Logger, le LogEvent) {
	instanceId := le.Detail["capacity-instance-id"].(string)
	zone := le.Detail["zone"].(string)
	logger.Debug(fmt.Sprintf("%s was launched in %s as part of cluster scale-up.", instanceId, zone))
}
