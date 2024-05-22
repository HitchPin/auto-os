package client

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go/aws/ec2metadata"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/pkg/errors"
	"github.com/spf13/viper"
	"log/slog"
	"os"
)

type CliConfig struct {
	ApiEndpoint string
	AwsProfile  *string
	AwsRegion   *string
}

func canAccess(p string) bool {

	v := viper.New()
	v.SetConfigFile(p)
	err := v.ReadInConfig()
	return err == nil
}

func InitConfig(cfgFile string, verbose bool) {

	configureLogging(verbose)

	viper.SetConfigType("yaml")
	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
		err := viper.ReadInConfig()
		if err != nil {
			panic(err)
			return
		}
		return
	}

	paths := []string{
		"./.maestro.yml",
		"$HOME/.maestro/config.yml",
		"/etc/maestro/config.yml",
	}
	for _, p := range paths {
		if canAccess(p) {
			slog.Debug("Loading config from location.", "Location", p)
			viper.SetConfigFile(p)
			err := viper.ReadInConfig()
			if err == nil {
				return
			}
		}
	}
	panic(errors.New("No configuration found!"))
	return
}

func GetMaestroClient() (*MaestroClient, error) {

	mConf := new(CliConfig)
	err := viper.Unmarshal(mConf)
	if err != nil {
		return nil, err
	}
	client, err := mConf.ToClient()
	if err != nil {
		return nil, err
	}
	return client, nil
}

func GetEC2MDClient() (*ec2metadata.EC2Metadata, error) {

	mConf := new(CliConfig)
	err := viper.Unmarshal(mConf)
	if err != nil {
		return nil, err
	}
	client := mConf.ToEC2MD()
	if err != nil {
		return nil, err
	}
	return client, nil
}

func (cliConfig CliConfig) ToClient() (*MaestroClient, error) {

	optionFuncs := []func(*config.LoadOptions) error{}
	if cliConfig.AwsRegion != nil && len(*cliConfig.AwsRegion) > 0 {
		optionFuncs = append(optionFuncs, config.WithRegion(*cliConfig.AwsRegion))
	} else {
		optionFuncs = append(optionFuncs, config.WithEC2IMDSRegion())
	}
	if cliConfig.AwsProfile != nil && len(*cliConfig.AwsProfile) > 0 {
		optionFuncs = append(optionFuncs, config.WithSharedConfigProfile(*cliConfig.AwsProfile))
	}
	cfg, err := config.LoadDefaultConfig(context.TODO(), optionFuncs...)
	if err != nil {
		return nil, err
	}
	slog.Info("Using configuration", "region", cfg.Region, "endpoint", cliConfig.ApiEndpoint)
	client := createMaestroClient(cfg.Credentials, cfg.Region, cliConfig.ApiEndpoint)
	return &client, nil
}

func (cliConfig CliConfig) ToEC2MD() *ec2metadata.EC2Metadata {

	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))
	svc := ec2metadata.New(sess)
	return svc
}

func configureLogging(verbose bool) {

	var opts slog.HandlerOptions
	if verbose {
		opts = slog.HandlerOptions{
			Level: slog.LevelDebug,
		}
	} else {
		opts = slog.HandlerOptions{
			Level: slog.LevelWarn,
		}
	}
	handler := slog.NewTextHandler(os.Stdout, &opts)

	logger := slog.New(handler)
	slog.SetDefault(logger)
}
