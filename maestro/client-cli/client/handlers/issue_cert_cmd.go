package handlers

import (
	"github.com/HitchPin/maestro/client-cli/client"
	"github.com/MakeNowJust/heredoc"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"os"
)

func IssueCertCmd() *cobra.Command {

	var hostname string
	var forServer bool
	var forClient bool
	var usage string

	var issueCertCmd = &cobra.Command{
		Use:   "issue-cert",
		Short: "Issues a certificate.",
		Example: heredoc.Doc(`
			Issues the current root CA certificate.
			$ certs issue-cert
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			var (
				name string
				err  error
			)
			if cmd.Flags().Lookup("host").Changed {
				name = hostname
			} else {
				name, err = os.Hostname()
				if err != nil {
					return errors.Wrap(err, "No hostname provided and failed to obtain hostname from os.")
				}
			}

			req := client.IssueCertificateRequest{
				Client: forClient,
				Server: forServer,
				Admin:  false,
				Name:   name,
				Usage:  usage,
			}
			mc := cmd.Context().Value("client").(*client.MaestroClient)
			resp, err := mc.IssueCertificate(req)
			if err != nil {
				return err
			}

			client.WriteStringToFile(resp.Cert, "public.pem")
			client.WriteStringToFile(resp.Key, "private.key")
			return nil
		},
	}

	issueCertCmd.Flags().StringVar(&hostname, "host", "", "--host")
	issueCertCmd.Flags().StringVar(&usage, "usage", "", "--usage")
	issueCertCmd.Flags().BoolVar(&forServer, "server", true, "--server")
	issueCertCmd.Flags().BoolVar(&forClient, "client", true, "--client")
	return issueCertCmd
}
