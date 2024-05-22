package discovery

import (
	"github.com/spf13/cobra"
)

func DiscoCommands() *cobra.Command {
	var discoCmd = &cobra.Command{
		Use: "discovery",
	}

	discoCmd.AddCommand(RegisterInstanceCmd())
	discoCmd.AddCommand(NewResetDiscoCmd())
	return discoCmd
}
