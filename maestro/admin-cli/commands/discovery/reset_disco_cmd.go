package discovery

import (
	"fmt"
	"github.com/HitchPin/maestro/actions/meta"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

func NewResetDiscoCmd() *cobra.Command {

	var resetDiscoCmd = &cobra.Command{
		Use:   "reset",
		Short: "Deregisters all instances for the disco.",
		Example: heredoc.Doc(`
			Deregisters all instances for the disco.
			$ reset
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			commonProps := cmd.Context().Value("commonProps").(util.CommonProps)

			res, err := meta.ResetDisco(meta.ResetDiscoInput{
				CommonProps: commonProps,
			})
			if err != nil {
				return err
			}
			fmt.Printf("Deregistered %s instances.\n", res.RemovedCount)
			return nil
		},
	}

	return resetDiscoCmd
}
