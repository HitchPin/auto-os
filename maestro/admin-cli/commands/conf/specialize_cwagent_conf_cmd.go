package conf

import (
	c "github.com/HitchPin/maestro/actions/conf"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/HitchPin/maestro/client-cli/client"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

func SpecializeCwAgentConfCmd() *cobra.Command {

	var specializeCmd = &cobra.Command{
		Use:   "specialize-cwagent-conf",
		Short: "Get conf for CloudWatch agent.",
		Example: heredoc.Doc(`
			Get OpenSearch conf for me.
			$ specialize-conf --role data
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			commonProps := cmd.Context().Value("commonProps").(util.CommonProps)

			req := c.SpecializeCloudWatchAgentConfInput{
				CommonProps: commonProps,
			}

			resp, err := c.SpecializeCloudWatchAgentConf(req)
			if err != nil {
				return err
			}

			client.WriteStringToFile(resp.AgentConfJson, "cwagent.json")
			return nil
		},
	}

	return specializeCmd
}
