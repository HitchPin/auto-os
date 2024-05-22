package conf

import (
	"fmt"
	"github.com/HitchPin/maestro/actions/meta"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

func SetClusterModeCmd() *cobra.Command {

	var bootstrapping bool
	var launched bool

	var setModeCmd = &cobra.Command{
		Use:   "set-cluster-mode",
		Short: "Set cluster mode",
		Example: heredoc.Doc(`
			Set cluster mode to bootstrapping
			$ conf set-cluster-mode --bootstrapping

			Set cluster mode to launched
			$ conf set-cluster-mode --launched
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			commonProps := cmd.Context().Value("commonProps").(util.CommonProps)

			input := meta.SetClusterModeInput{
				CommonProps: commonProps,
			}
			if cmd.Flags().Lookup("bootstrapping").Changed && bootstrapping {
				input.Bootstrapping = true
			} else {
				input.Bootstrapping = false
			}

			res, err := meta.SetClusterMode(input)
			if err != nil {
				return err
			}

			cm := res.ParamValue
			fmt.Printf("Set cluster mode to: %s.\n", cm)
			return nil
		},
	}

	setModeCmd.Flags().BoolVar(&bootstrapping, "bootstrapping", false, "--bootstrapping")
	setModeCmd.Flags().BoolVar(&launched, "launched", false, "--launched")
	setModeCmd.MarkFlagsMutuallyExclusive("bootstrapping", "launched")
	return setModeCmd
}
