package main

import (
	"context"
	"fmt"
	"os"

	"github.com/HitchPin/maestro/actions/util"
	cli "github.com/HitchPin/maestro/admin-cli/commands"
	"github.com/HitchPin/maestro/admin-cli/commands/certs"
	"github.com/HitchPin/maestro/admin-cli/commands/conf"
	"github.com/HitchPin/maestro/admin-cli/commands/discovery"
	"github.com/HitchPin/maestro/admin-cli/tui"
	"github.com/HitchPin/maestro/bootstrapping-workflow/configuration"
	"github.com/HitchPin/maestro/bootstrapping-workflow/workflow"
	"github.com/MakeNowJust/heredoc"
	"github.com/aws/aws-sdk-go-v2/service/sts"
	"github.com/spf13/cobra"
)

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
	cobra.OnInitialize(func() {
		cli.InitConfig(cfgFile)
	})
	var rootCmd = &cobra.Command{
		Use:     "maestro",
		Version: "0.1.0",
		Short:   "Hitchpin search cluster utilities.",
		PersistentPreRunE: func(cmd *cobra.Command, args []string) error {

			if cmd.Use == "config" {
				return nil
			}
			if cmd.Use == "hydrate" {
				return nil
			}
			config, err := cli.GetMaestroConfig()
			config.Cli.ConfigureLogging()
			if err != nil {
				return err
			}

			awsConf, err := config.Cloud.ToAwsConfig()
			commonProps := util.CommonProps{
				AwsConf:                      *awsConf,
				CertificateAuthoritySecretId: config.Certificates.CertificateAuthoritySecretId,
				ClusterAdminSecretId:         config.Conf.ClusterAdminSecretId,
				ClusterNameParameterId:       config.Conf.ClusterNameParameterId,
				ClusterModeParameterId:       config.Conf.ClusterModeParameterId,
				DiscoveryServiceName:         config.Discovery.ServiceName,
				DiscoveryServiceId:           config.Discovery.ServiceId,
				DiscoveryNamespaceName:       config.Discovery.NamespaceName,
				EventBusName:                 config.Conf.EventBusName,
				ConfigBucket:                 config.Conf.ConfigBucket,
				ConfigPrefix:                 config.Conf.ConfigPrefix,
			}

			ctx := context.WithValue(cmd.Context(), "config", config)
			ctx = context.WithValue(ctx, "commonProps", commonProps)
			cmd.SetContext(ctx)
			return nil
		},
	}

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is ./.hp-mlcommons.yaml)")

	rootCmd.AddCommand(cli.ConfigCommand())
	rootCmd.AddCommand(certs.CertCommands())
	rootCmd.AddCommand(conf.ConfCommands())
	rootCmd.AddCommand(discovery.DiscoCommands())
	rootCmd.AddCommand(createTuiCmd())
	rootCmd.AddCommand(createBootstrapCmd())

	return rootCmd
}

func createTuiCmd() *cobra.Command {

	var tuiCmd = &cobra.Command{
		Use:   "tui",
		Short: "Graphical 'pane of glass'",
		Example: heredoc.Doc(`
			Monitor the entire cluster from your terminal.
			$ tui
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {
			tui.RunTui()
			return nil
		},
	}

	return tuiCmd
}

func createBootstrapCmd() *cobra.Command {

	var bsCmd = &cobra.Command{
		Use:   "bootstrap-cluster",
		Short: "Bootstrap cluster",
		Example: heredoc.Doc(`
			Bootstrap cluster
			$ bootstrap-cluster
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {
			config := cmd.Context().Value("config").(*cli.MaestroConfig)
			awsConf, _ := config.Cloud.ToAwsConfig()

			stsClient := sts.NewFromConfig(*awsConf)
			res, _ := stsClient.GetCallerIdentity(context.TODO(), &sts.GetCallerIdentityInput{})
			accountId := *res.Account
			cwLogArn := fmt.Sprintf("arn:aws:logs:%s:%s:log-group:%s", config.Cloud.AwsRegion, accountId, config.Conf.EventLogGroupName)

			workflow.RunBootstrapClusterWorkflow(configuration.ExecutionConfiguration{
				Cloud: configuration.CloudConf{
					AwsConf: *awsConf,
					Region:  config.Cloud.AwsRegion,
				},
				Params: configuration.Parameters{
					ClusterName: config.Conf.ClusterNameParameterId,
					ClusterMode: config.Conf.ClusterModeParameterId,
				},
				EventsLogGroup: cwLogArn,
				Stage:          config.Stage,
			})
			return nil
		},
	}

	return bsCmd
}
