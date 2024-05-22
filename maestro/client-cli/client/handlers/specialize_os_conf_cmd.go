package handlers

import (
	"fmt"
	"github.com/HitchPin/maestro/client-cli/client"
	"github.com/MakeNowJust/heredoc"
	"github.com/aws/aws-sdk-go/aws/ec2metadata"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"os"
)

func SpecializeOpenSearchConfCmd() *cobra.Command {

	var role string
	var host string
	var az string

	var dlRootCmd = &cobra.Command{
		Use:   "specialize-os-conf",
		Short: "Get conf for OpenSearch.",
		Example: heredoc.Doc(`
			Get OpenSearch conf for me.
			$ specialize-conf --role data
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			ec2md := cmd.Context().Value("ec2md").(*ec2metadata.EC2Metadata)
			req := client.SpecializeOpenSearchConfRequest{}

			if cmd.Flags().Lookup("role").Changed {
				req.Role = role
			} else {
				mdRole, err := ec2md.GetMetadata("tags/instance/Role")
				if err != nil {
					return errors.Wrap(err, "Unable to fetch role from EC2MD.")
				}
				fmt.Printf("Using role from EC2 Metadata: %s\n", mdRole)
				req.Role = mdRole
			}

			if cmd.Flags().Lookup("host").Changed {
				req.Hostname = host
			} else {
				h, _ := os.Hostname()
				req.Hostname = h
			}
			if cmd.Flags().Lookup("az").Changed {
				req.AvailabilityZone = az
			} else {
				az, err := ec2md.GetMetadata("placement/availability-zone")
				if err != nil {
					return errors.Wrap(err, "Unable to fetch AZ from EC2MD.")
				}
				req.AvailabilityZone = az
			}

			mc := cmd.Context().Value("client").(*client.MaestroClient)
			resp, err := mc.SpecializeOpenSearchConf(req)
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

	dlRootCmd.Flags().StringVar(&az, "az", "", "--az")
	dlRootCmd.Flags().StringVar(&host, "host", "", "--host")
	dlRootCmd.Flags().StringVar(&role, "role", "", "--role")
	return dlRootCmd
}
