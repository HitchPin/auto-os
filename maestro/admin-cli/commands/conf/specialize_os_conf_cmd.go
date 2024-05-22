package conf

import (
	c "github.com/HitchPin/maestro/actions/conf"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/HitchPin/maestro/client-cli/client"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

func SpecializeOsConfCmd() *cobra.Command {

	var role string
	var host string
	var az string

	var specializeCmd = &cobra.Command{
		Use:   "specialize-opensearch-conf",
		Short: "Get conf for OpenSearch.",
		Example: heredoc.Doc(`
			Get OpenSearch conf for me.
			$ specialize-conf --role data
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			commonProps := cmd.Context().Value("commonProps").(util.CommonProps)
			req := c.SpecializeOpenSearchConfInput{
				CommonProps: commonProps,
				Specificities: c.Specifics{
					AvailabilityZone: az,
					Hostname:         host,
					Role:             role,
				},
			}

			resp, err := c.SpecializeOpenSearchConf(req)
			if err != nil {
				return err
			}

			client.WriteStringToFile(resp.PreSecPluginOpenSearchYml, "pre-sec-plugin-opensearch.yml")
			client.WriteStringToFile(resp.FinalOpenSearchYml, "final-opensearch.yml")
			client.WriteStringToFile(resp.InternalUsersYml, "internal_users.yml")
			client.WriteStringToFile(resp.SecurityYml, "security.yml")
			client.WriteStringToFile(resp.RolesYml, "roles.yml")
			client.WriteStringToFile(resp.RolesMappingYml, "roles_mapping.yml")
			return nil
		},
	}

	specializeCmd.Flags().StringVar(&az, "az", "", "--az")
	specializeCmd.Flags().StringVar(&host, "host", "", "--host")
	specializeCmd.Flags().StringVar(&role, "role", "", "--role")
	specializeCmd.MarkFlagRequired("az")
	specializeCmd.MarkFlagRequired("host")
	specializeCmd.MarkFlagRequired("role")
	return specializeCmd
}
