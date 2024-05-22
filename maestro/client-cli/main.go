package main

import (
	"context"
	"github.com/HitchPin/maestro/client-cli/client"
	"github.com/HitchPin/maestro/client-cli/client/handlers"
	"github.com/spf13/cobra"
	"os"
)
import _ "embed"

//go:embed build_number.txt
var buildNumber string

func main() {
	var rootCmd = createCommand()
	err := rootCmd.Execute()

	if err != nil {
		os.Exit(1)
	}
}

func createCommand() *cobra.Command {

	cobra.EnableTraverseRunHooks = true
	var cfgFile string
	var verbose bool
	cobra.OnInitialize(func() {
		client.InitConfig(cfgFile, verbose)
	})
	var version = "0.1." + buildNumber
	var rootCmd = &cobra.Command{
		Use:     "maestro",
		Version: version,
		Short:   "Hitchpin HTTP Maestro client.",
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {

			ec2md, err := client.GetEC2MDClient()
			if err != nil {
				return err
			}
			client, err := client.GetMaestroClient()
			if err != nil {
				return err
			}

			ctx := context.WithValue(cmd.Context(), "ec2md", ec2md)
			ctx = context.WithValue(ctx, "client", client)
			cmd.SetContext(ctx)
			return nil
		},
	}

	rootCmd.PersistentFlags().BoolVar(&verbose, "verbose", false, "verbose logging")
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is ./.hp-mlcommons.yaml)")

	rootCmd.AddCommand(handlers.GetRootCmd())
	rootCmd.AddCommand(handlers.IssueCertCmd())
	rootCmd.AddCommand(handlers.IssueAdminCertCmd())
	rootCmd.AddCommand(handlers.SpecializeOpenSearchConfCmd())
	rootCmd.AddCommand(handlers.SpecializeCwAgentConfCmd())
	rootCmd.AddCommand(handlers.RegisterInstanceCmd())
	rootCmd.AddCommand(handlers.CurlClusterCmd())
	rootCmd.AddCommand(handlers.SignalInitFailCmd())
	return rootCmd
}
