package conf

import (
	"fmt"
	"github.com/HitchPin/maestro/actions/conf"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/MakeNowJust/heredoc"
	"github.com/spf13/cobra"
	"golang.org/x/term"
	"strings"
	"syscall"
)

func SetClusterPwdCmd() *cobra.Command {

	var username string

	var setPwdCmd = &cobra.Command{
		Use:   "set-admin-pwd",
		Short: "Set cluster admin credentials",
		Example: heredoc.Doc(`
			Generate a CA cert
			$ certs new-root --org HitchPin --country US --state TX --city Dallas
		`),
		Args: cobra.ExactArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {

			commonProps := cmd.Context().Value("commonProps").(util.CommonProps)

			pwd, err := promptPwd()
			if err != nil {
				return err
			}

			input := conf.SetClusterPwdInput{
				CommonParams: commonProps,
				Password:     pwd,
			}
			if cmd.Flags().Lookup("username").Changed {
				input.Username = username
			} else {
				input.Username = "admin"
			}

			res, err := conf.SetClusterPwd(input)
			if err != nil {
				return err
			}

			version := res.Version
			fmt.Printf("Cluster admin password updated with version: %s.\n", version)
			return nil
		},
	}

	setPwdCmd.Flags().StringVarP(&username, "username", "u", "admin", "--username admin")

	return setPwdCmd
}

func promptPwd() (string, error) {
	fmt.Print("Enter Password: ")
	bytePassword, err := term.ReadPassword(int(syscall.Stdin))
	if err != nil {
		return "", err
	}

	password := string(bytePassword)
	return strings.TrimSpace(password), nil
}
