package handlers

import (
	"fmt"
	"github.com/HitchPin/maestro/client-cli/client"
	"github.com/MakeNowJust/heredoc"
	"github.com/aws/aws-sdk-go/aws/ec2metadata"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
)

func SpecializeCwAgentConfCmd() *cobra.Command {

	var role string
	var specializeCwAgentCmd = &cobra.Command{
		Use:   "specialize-cwagent-conf",
		Short: "Get conf for CloudWatch agent.",
		Example: heredoc.Doc(`
			Get CloudWatch agent conf for me.
			$ specialize-cwagent-conf
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			req := client.SpecializeCwAgentConfRequest{}
			ec2md := cmd.Context().Value("ec2md").(*ec2metadata.EC2Metadata)

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
			mc := cmd.Context().Value("client").(*client.MaestroClient)
			resp, err := mc.SpecializeCwAgentConf(req)
			if err != nil {
				return err
			}

			client.WriteStringToFile(resp.AgentConfJson, "cwagent.json")
			return nil
		},
	}

	specializeCwAgentCmd.Flags().StringVar(&role, "role", "", "--role")

	return specializeCwAgentCmd
}
