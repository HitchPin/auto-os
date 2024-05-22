package discovery

import (
	"github.com/spf13/cobra"
)

func ClusterCmds() *cobra.Command {
	var clusterCmd = &cobra.Command{
		Use: "cluster",
	}

	return clusterCmd
}
