package handlers

import (
	"fmt"
	"github.com/HitchPin/maestro/client-cli/client"
	"github.com/MakeNowJust/heredoc"
	"github.com/aws/aws-sdk-go/aws/ec2metadata"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
)

func RegisterInstanceCmd() *cobra.Command {

	var instanceId string

	var registerInstanceCmd = &cobra.Command{
		Use:   "register-instance",
		Short: "Register this instance for discovery.",
		Example: heredoc.Doc(`
			Register this instance for discovery.
			$ register-instance
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			ec2md := cmd.Context().Value("ec2md").(*ec2metadata.EC2Metadata)
			req := client.RegisterInstanceRequest{}

			if cmd.Flags().Lookup("instanceId").Changed {
				req.InstanceId = instanceId
			} else {
				mdRes, err := ec2md.GetMetadata("instance-id")
				if err != nil {
					return errors.Wrap(err, "No instance id provided and failed to obtain instance id from EC2 metadata service.")
				}
				req.InstanceId = mdRes
			}

			mc := cmd.Context().Value("client").(*client.MaestroClient)
			resp, err := mc.RegisterInstance(req)
			if err != nil {
				return err
			}

			fmt.Printf("Registered instance with registration id %s.\n", resp.RegistrationId)
			return nil
		},
	}

	registerInstanceCmd.Flags().StringVar(&instanceId, "instanceId", "", "--instanceId i-1234567890")

	return registerInstanceCmd
}
