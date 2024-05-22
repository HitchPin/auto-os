package conf

import (
	"fmt"
	"github.com/HitchPin/maestro/actions/meta"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

func GetClusterModeCmd() *cobra.Command {

	var getModeCmd = &cobra.Command{
		Use:   "get-cluster-mode",
		Short: "Get cluster mode",
		Example: heredoc.Doc(`
			Get cluster mode
			$ conf get-cluster-mode
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			commonProps := cmd.Context().Value("commonProps").(util.CommonProps)

			input := meta.GetClusterModeInput{
				CommonProps: commonProps,
			}

			res, err := meta.GetClusterMode(input)
			if err != nil {
				return err
			}

			var modeStr string
			if res.Bootstrapping {
				modeStr = "bootstrapping"
			} else {
				modeStr = "launched"
			}
			fmt.Printf("Cluster Mode: %s.\n", modeStr)
			return nil
		},
	}

	return getModeCmd
}
