package certs

import (
	"github.com/spf13/cobra"
)

func CertCommands() *cobra.Command {
	var certCmds = &cobra.Command{
		Use: "certs",
	}

	certCmds.AddCommand(issueCmd())
	certCmds.AddCommand(newRootCmd())
	certCmds.AddCommand(getRootCmd())
	return certCmds
}
