package discovery

import (
	"fmt"
	"github.com/HitchPin/maestro/actions/meta"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

func RegisterInstanceCmd() *cobra.Command {

	var instanceId string

	var registerCmd = &cobra.Command{
		Use:   "register-instance",
		Short: "Register an instance for discovery.",
		Example: heredoc.Doc(`
			Register an instance for discovery.
			$ discovery register-instance --instanceId i-1234567890
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			commonProps := cmd.Context().Value("commonProps").(util.CommonProps)

			input := meta.RegisterInstanceInput{
				CommonParams: commonProps,
				InstanceId:   instanceId,
			}

			res, err := meta.RegisterInstance(input)
			if err != nil {
				return err
			}

			fmt.Printf("Registered instance with registration id: %s.\n", res.RegistrationId)
			return nil
		},
	}

	registerCmd.Flags().StringVar(&instanceId, "instanceId", "", "--instanceId i-123456779")
	registerCmd.MarkFlagRequired("instanceId")
	return registerCmd
}
