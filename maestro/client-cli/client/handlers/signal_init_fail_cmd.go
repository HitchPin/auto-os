package handlers

import (
	"fmt"
	"github.com/HitchPin/maestro/client-cli/client"
	"github.com/MakeNowJust/heredoc"
	"github.com/aws/aws-sdk-go/aws/ec2metadata"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
)

func SignalInitFailCmd() *cobra.Command {

	var debugMsg string
	var instanceId string

	var signalFailCmd = &cobra.Command{
		Use:   "signal-init-fail",
		Short: "Signal initialization failed.",
		Example: heredoc.Doc(`
			Get node info:
			$ signal-init-fail --debug "A debug message."
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			ec2md := cmd.Context().Value("ec2md").(*ec2metadata.EC2Metadata)
			mc := cmd.Context().Value("client").(*client.MaestroClient)

			signalReq := client.SignalInitFailRequest{}

			if cmd.Flags().Lookup("instanceId").Changed {
				signalReq.InstanceId = instanceId
			} else {
				mdRes, err := ec2md.GetMetadata("instance-id")
				if err != nil {
					return errors.Wrap(err, "No instance id provided and failed to obtain instance id from EC2 metadata service.")
				}
				signalReq.InstanceId = mdRes
			}

			if cmd.Flags().Lookup("debug").Changed {
				signalReq.DebugMessage = &debugMsg
			} else {
				empty := ""
				signalReq.DebugMessage = &empty
			}

			resp, err := mc.SignalInitFail(signalReq)
			if err != nil {
				return err
			}

			fmt.Printf("Event ID: %s\n", resp.EventId)
			return nil
		},
	}

	signalFailCmd.Flags().StringVar(&debugMsg, "debug", "", "--debug \"A debug message.\"")
	signalFailCmd.Flags().StringVar(&instanceId, "instanceId", "", "--instanceId i-12345")

	return signalFailCmd
}
