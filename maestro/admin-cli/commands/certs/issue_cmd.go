package certs

import (
	"os"
	"path"
	"strings"

	actions "github.com/HitchPin/maestro/actions/certs"
	"github.com/HitchPin/maestro/actions/util"
	cli "github.com/HitchPin/maestro/admin-cli/commands"
	"github.com/HitchPin/maestro/certs/models"
	"github.com/MakeNowJust/heredoc"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
)

func issueCmd() *cobra.Command {

	var outDir string
	var certFile string
	var keyFile string
	var usage string
	var isServer bool
	var isClient bool
	var isAdmin bool
	var sans []string

	var issueCmd = &cobra.Command{
		Use:   "issue common-name.com",
		Short: "Issue a certificate signed by a CA cert.",
		Example: heredoc.Doc(`
			Issue a certificate signed by the CA cert.
			$ issue search.internal.hitchpin.com --usage "Data Nodes"
		`),
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {

			config := cmd.Context().Value("config").(*cli.MaestroConfig)
			commonProps := cmd.Context().Value("commonProps").(util.CommonProps)

			certConf := config.Certificates

			commonName := args[0]

			var (
				outDirPath   string
				certFilePath string
				keyFilePath  string
			)

			if cmd.Flags().Lookup("outDir").Changed {
				outDirPath = outDir
				err := os.MkdirAll(outDirPath, os.ModePerm)
				if err != nil {
					return errors.Wrap(err, "Failed to create out directory.")
				}
			} else {
				outDirPath = "./"
			}

			cnameParts := strings.Split(commonName, ".")
			defaultFileNameRoot := cnameParts[0]

			if cmd.Flags().Lookup("certFile").Changed {
				certFilePath = path.Join(outDirPath, certFile)
			} else {
				certFilePath = path.Join(outDirPath, defaultFileNameRoot+".pem")
			}

			if cmd.Flags().Lookup("keyFile").Changed {
				keyFilePath = path.Join(outDirPath, keyFile)
			} else {
				keyFilePath = path.Join(outDirPath, defaultFileNameRoot+".key")
			}

			sub := models.Subject{
				CommonName:         &commonName,
				OrganizationalUnit: &usage,
			}

			req := actions.IssueCertificateInput{
				CommonProps: commonProps,
				Subject:     sub,
				KeySize:     certConf.KeySize,
				ForServer:   isServer,
				ForClient:   isClient,
				ForAdmin:    isAdmin,
			}

			has_san := cmd.Flags().Lookup("san").Changed && len(sans) > 0
			if has_san {
				altNames := models.AlternativeNames{}

				if has_san {
					altNames.DNSNames = sans
				}
				req.AlternateNames = &altNames
			}

			cert, err := actions.IssueCertificate(req)
			if err != nil {
				return err
			}

			err = SaveCertToFile(StoredCertificate{
				CertificatePem: cert.CertificatePem,
				PrivateKeyPem:  cert.PrivateKeyPem,
			}, certFilePath, keyFilePath)

			if err != nil {
				return err
			}
			return nil
		},
	}

	issueCmd.Flags().StringVar(&outDir, "outDir", "", "out directory")
	issueCmd.Flags().StringVar(&certFile, "certFile", "", "name of the certificate file")
	issueCmd.Flags().StringVar(&keyFile, "keyFile", "", "name of the key file")
	issueCmd.Flags().StringVar(&usage, "usage", "", "org (OU=)")
	issueCmd.Flags().BoolVar(&isServer, "server", true, "Used by server")
	issueCmd.Flags().BoolVar(&isClient, "client", false, "Used by client")
	issueCmd.Flags().BoolVar(&isAdmin, "admin", false, "For admin auth")
	issueCmd.Flags().StringArrayVar(&sans, "san", []string{}, "subject alternative names")

	err := issueCmd.MarkFlagRequired("usage")
	if err != nil {
		panic(err)
	}
	return issueCmd
}
