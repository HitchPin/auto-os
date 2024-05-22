package conf

import (
	"github.com/spf13/cobra"
)

func ConfCommands() *cobra.Command {
	var certCmds = &cobra.Command{
		Use: "conf",
	}

	certCmds.AddCommand(SpecializeCwAgentConfCmd())
	certCmds.AddCommand(SpecializeOsConfCmd())
	certCmds.AddCommand(SetClusterPwdCmd())
	certCmds.AddCommand(SetClusterModeCmd())
	certCmds.AddCommand(GetClusterModeCmd())
	return certCmds
}
