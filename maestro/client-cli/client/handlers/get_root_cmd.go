package handlers

import (
	"github.com/HitchPin/maestro/client-cli/client"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

func GetRootCmd() *cobra.Command {

	var outLocation string
	var dlRootCmd = &cobra.Command{
		Use:   "download-root",
		Short: "Downloads the current CA root certificate.",
		Example: heredoc.Doc(`
			Downloads the current root CA certificate.
			$ certs get-root
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			mc := cmd.Context().Value("client").(*client.MaestroClient)
			resp, err := mc.GetRootCA()
			if err != nil {
				return err
			}

			client.WriteStringToFile(resp.CertPem, outLocation)
			return nil
		},
	}

	dlRootCmd.Flags().StringVar(&outLocation, "out", "", "--out ca.pem")
	dlRootCmd.MarkFlagRequired("out")
	return dlRootCmd
}
