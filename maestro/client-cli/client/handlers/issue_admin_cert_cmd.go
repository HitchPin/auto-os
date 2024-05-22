package handlers

import (
	"github.com/HitchPin/maestro/client-cli/client"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

func IssueAdminCertCmd() *cobra.Command {

	var issueAdminCertCmd = &cobra.Command{
		Use:   "issue-admin-cert",
		Short: "Issues a certificate for use with superadmin OpenSearch APIs.",
		Example: heredoc.Doc(`
			Issues a certificate for use with superadmin OpenSearch APIs
			$ certs issue-admin-cert
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			req := client.IssueCertificateRequest{
				Client: true,
				Server: true,
				Admin:  true,
				Name:   "admin",
			}
			mc := cmd.Context().Value("client").(*client.MaestroClient)
			resp, err := mc.IssueCertificate(req)
			if err != nil {
				return err
			}

			client.WriteStringToFile(resp.Cert, "admin.pem")
			client.WriteStringToFile(resp.Key, "admin.key")
			return nil
		},
	}

	return issueAdminCertCmd
}
