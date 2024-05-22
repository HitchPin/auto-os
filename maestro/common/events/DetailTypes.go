package events

// These are basically just transformations and enrichments of the
// events emitted by Auto Scaling
const NodeCapacityLaunched = "Node Capacity Launched"
const NodeCapacityTerminated = "Node Capacity Terminated"

// Runs at the end of the EC2 UserData script after cluster bootstrap or join
const NodeInitializedAndRegistered = "Node initialized and registered"

// Runs after EC2 Instance States event was received by the Disco cleanup Lambda
const NodeTerminatedAndUnregistered = "Node terminated and unregistered"

// Runs if the EC2 UserData script has an error that gets trapped
const NodeInitFailed = "Node initialization failed"

// Emitted from the custom OpenSearch eventing and metrics plugin
const ClusterHealthStateChanged = "Cluster Health State Changed"
const NodeJoinedCluster = "Node Joined the Cluster"
const NodeLeftCluster = "Node Left the Cluster"
const ClusterManagerChanged = "Cluster Manager Changed"

var EventShortNames = map[string]string{
	NodeInitializedAndRegistered:  "NodeInitializedAndRegistered",
	ClusterHealthStateChanged:     "ClusterHealthStateChanged",
	NodeJoinedCluster:             "NodeJoinedCluster",
	NodeLeftCluster:               "NodeLeftCluster",
	ClusterManagerChanged:         "ClusterManagerChanged",
	NodeCapacityLaunched:          "NodeCapacityLaunched",
	NodeCapacityTerminated:        "NodeCapacityTerminated",
	NodeTerminatedAndUnregistered: "NodeTerminatedAndUnregistered",
}
