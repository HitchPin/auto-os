package certs

import (
	"fmt"

	"github.com/HitchPin/maestro/actions/certs"
	"github.com/HitchPin/maestro/actions/util"
	cli "github.com/HitchPin/maestro/admin-cli/commands"
	"github.com/HitchPin/maestro/certs/models"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
)

func newRootCmd() *cobra.Command {

	var org string
	var country string
	var state string
	var city string

	var genCmd = &cobra.Command{
		Use:   "new-root",
		Short: "Generate a new CA cert",
		Example: heredoc.Doc(`
			Generate a CA cert
			$ certs new-root --org HitchPin --country US --state TX --city Dallas
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			config := cmd.Context().Value("config").(*cli.MaestroConfig)
			commonProps := cmd.Context().Value("commonProps").(util.CommonProps)
			certConf := config.Certificates

			sub := models.Subject{}

			if cmd.Flags().Lookup("org").Changed {
				sub.Organization = &org
			}
			if cmd.Flags().Lookup("country").Changed {
				sub.Country = &country
			}
			if cmd.Flags().Lookup("state").Changed {
				sub.State = &state
			}
			if cmd.Flags().Lookup("city").Changed {
				sub.City = &city
			}

			actionReq := certs.GenerateRootCAInput{
				CommonProps: commonProps,
				KeySize:     certConf.KeySize,
				Subject:     sub,
			}
			actionRes, err := certs.GenerateRootCA(actionReq)
			if err != nil {
				return err
			}

			version := actionRes.Version
			fmt.Printf("New CA created with version %s.", version)
			return nil
		},
	}

	genCmd.Flags().StringVar(&org, "org", "", "org (O=)")
	genCmd.Flags().StringVar(&country, "country", "", "country (C=)")
	genCmd.Flags().StringVar(&state, "state", "", "state or province (ST=)")
	genCmd.Flags().StringVar(&city, "city", "", "locality (L=)")
	_ = genCmd.MarkFlagRequired("org")
	_ = genCmd.MarkFlagRequired("country")
	_ = genCmd.MarkFlagRequired("state")
	_ = genCmd.MarkFlagRequired("city")

	return genCmd
}
