package certs

import (
	"fmt"
	"github.com/HitchPin/maestro/actions/certs"
	"github.com/HitchPin/maestro/actions/util"
	c "github.com/HitchPin/maestro/certs"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

func getRootCmd() *cobra.Command {

	var version string

	var issueCmd = &cobra.Command{
		Use:   "get-root",
		Short: "Gets the current CA root certificate.",
		Example: heredoc.Doc(`
			Issue a certificate signed by the CA cert.
			$ certs get-root
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			commonProps := cmd.Context().Value("commonProps").(util.CommonProps)

			var caVersion *string
			if cmd.Flags().Lookup("version").Changed {
				caVersion = &version
			} else {
				caVersion = nil
			}

			res, err := certs.GetRootCA(certs.GetRootCAInput{
				CommonProps: commonProps,
				Version:     caVersion,
			})
			if err != nil {
				return err
			}
			cert := res.Certificate
			bs, err := c.CertBytesToPem(cert.Raw)

			fmt.Println()
			fmt.Printf("Root Certificate:\n")
			fmt.Printf("\tSubject:\t%s\n", cert.Subject.String())
			fmt.Printf("\tSerial:\t\t%s\n", cert.SerialNumber.String())
			fmt.Printf("\tExpiration:\t%s\n", cert.NotAfter.String())
			fmt.Printf("\tPEM:\n%s\n\n", *bs)
			return nil
		},
	}

	issueCmd.Flags().StringVar(&version, "version", "", "Optionally a specific version to get.")

	return issueCmd
}
