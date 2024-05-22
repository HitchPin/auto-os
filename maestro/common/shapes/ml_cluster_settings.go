package shapes

type MlClusterSettings struct {
	AllowMlOnDataNodes             *bool
	EnableMemory                   *bool
	EnableRagPipeline              *bool
	EnableConnectorAccessControl   *bool
	EnableModelAccessControl       *bool
	TrustedConnectorEndpointsRegex []string
}
