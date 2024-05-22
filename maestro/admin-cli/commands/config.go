package cli

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials/stscreds"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
	elastic7 "github.com/olivere/elastic/v7"
	"github.com/spf13/viper"
	"log"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"time"
)

type CertConfig struct {
	CertificateAuthoritySecretId string
	KeySize                      int
}

type CliConfig struct {
	LogLevel            string
	LogFormat           string
	LogDebugInformation bool
}

type CloudConfig struct {
	AwsAssumeRoleArn string
	AwsProfile       string
	AwsRegion        string
}
type DiscoveryConfig struct {
	ServiceId     string
	ServiceName   string
	NamespaceName string
}
type ConfConfig struct {
	EventBusName           string
	EventLogGroupName      string
	ConfigBucket           string
	ConfigPrefix           string
	ClusterNameParameterId string
	ClusterModeParameterId string
	ClusterAdminSecretId   string
}
type MaestroConfig struct {
	SearchEndpoint       string
	SearchCredentialsArn string
	Stage                string
	Certificates         CertConfig
	Cloud                CloudConfig
	Cli                  CliConfig
	Conf                 ConfConfig
	Discovery            DiscoveryConfig
}

func InitConfig(cfgFile string) {

	viper.SetDefault("Certificates.Org", "HitchPin")
	viper.SetDefault("Certificates.Country", "US")
	viper.SetDefault("Certificates.State", "Texas")
	viper.SetDefault("Certificates.City", "Dallas")
	viper.SetDefault("Certificates.CertKeySize", "2048")
	viper.SetDefault("Cli.LogLevel", "info")
	viper.SetDefault("Cli.LogFormat", "text")

	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		viper.SetConfigName(".hp-maestro")
		viper.SetConfigType("yaml")
		viper.AddConfigPath("/etc/maestro")
		viper.AddConfigPath("$HOME/.maestro")
		viper.AddConfigPath(".")
	}
	err := viper.ReadInConfig()
	if err != nil {
		panic(fmt.Errorf("No configuration found!"))
	}
}

func GetMaestroConfig() (*MaestroConfig, error) {

	mConf := new(MaestroConfig)
	err := viper.Unmarshal(mConf)
	if err != nil {
		return nil, err
	}

	return mConf, nil
}

func (config CliConfig) CreateLoggerHandlerOpts() *slog.HandlerOptions {
	var ll slog.Level

	switch config.LogLevel {
	case "debug":
		ll = slog.LevelDebug
		break
	case "info":
		ll = slog.LevelInfo
		break
	case "warn":
		ll = slog.LevelWarn
		break
	case "error":
		ll = slog.LevelError
		break
	}

	opts := &slog.HandlerOptions{
		Level: ll,
	}
	if config.LogDebugInformation {
		opts.AddSource = true
		return opts
	}
	return opts
}

func (config CliConfig) ConfigureLogging() {

	var handler slog.Handler

	opts := config.CreateLoggerHandlerOpts()

	if config.LogFormat == "json" {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	logger := slog.New(handler)
	slog.SetDefault(logger)
}

func (config MaestroConfig) GetOpenSearchClient() (*elastic7.Client, error) {

	var traceHandler slog.Handler
	var infoHandler slog.Handler
	var errorHandler slog.Handler

	handlerOpts := config.Cli.CreateLoggerHandlerOpts()

	if config.Cli.LogFormat == "json" {
		traceHandler = slog.NewJSONHandler(os.Stdout, handlerOpts)
		infoHandler = slog.NewJSONHandler(os.Stdout, handlerOpts)
		errorHandler = slog.NewJSONHandler(os.Stderr, handlerOpts)
	} else {
		traceHandler = slog.NewTextHandler(os.Stdout, handlerOpts)
		infoHandler = slog.NewTextHandler(os.Stdout, handlerOpts)
		errorHandler = slog.NewTextHandler(os.Stderr, handlerOpts)
	}
	traceLogger := slog.New(traceHandler)
	wrappedTraceLogger := SlogWrapper{
		level:   slog.LevelDebug,
		slogger: *traceLogger,
		context: context.Background(),
	}
	infoLogger := slog.New(infoHandler)
	wrappedInfoLogger := SlogWrapper{
		level:   slog.LevelInfo,
		slogger: *infoLogger,
		context: context.Background(),
	}
	errorLogger := slog.New(errorHandler)
	wrappedErrorLogger := SlogWrapper{
		level:   slog.LevelError,
		slogger: *errorLogger,
		context: context.Background(),
	}

	parsedUrl, err := url.Parse(config.SearchEndpoint)
	if err != nil {
		return nil, err
	}
	opts := []elastic7.ClientOptionFunc{
		elastic7.SetURL(config.SearchEndpoint),
		elastic7.SetScheme(parsedUrl.Scheme),
		elastic7.SetSniff(false),
		elastic7.SetHealthcheck(false),
		elastic7.SetHttpClient(tlsHttpClient(&config, map[string]string{})),
		elastic7.SetSniff(false),
		elastic7.SetTraceLog(wrappedTraceLogger),
		elastic7.SetInfoLog(wrappedInfoLogger),
		elastic7.SetErrorLog(wrappedErrorLogger),
	}
	creds, err := config.LoadCredentialsFromSecret()
	if err != nil {
		return nil, err
	}
	opts = append(opts, elastic7.SetBasicAuth(creds.Username, creds.Password))

	osClient, err := elastic7.NewClient(opts...)
	if err != nil {
		if errors.Is(err, elastic7.ErrNoClient) {
			log.Printf("[INFO] couldn't create client: %T, %s, %T", err, err.Error(), errors.Unwrap(err))
			return nil, errors.New("HEAD healthcheck failed: This is usually due to network or permission issues. The underlying error isn't accessible, please debug by disabling healthchecks.")
		}
		return nil, err
	}

	return osClient, nil
}

func tlsHttpClient(conf *MaestroConfig, headers map[string]string) *http.Client {
	// Configure TLS/SSL
	tlsConfig := &tls.Config{
		InsecureSkipVerify: true,
	}

	transport := &http.Transport{TLSClientConfig: tlsConfig}
	rt := WithHeader(transport)
	for k, v := range headers {
		rt.Set(k, v)
	}

	client := &http.Client{Transport: rt}

	return client
}

type withHeader struct {
	http.Header
	hostOverride string
	rt           http.RoundTripper
}

func WithHeader(rt http.RoundTripper) withHeader {
	if rt == nil {
		rt = http.DefaultTransport
	}

	return withHeader{Header: make(http.Header), rt: rt}
}

func (h withHeader) RoundTrip(req *http.Request) (*http.Response, error) {
	for k, v := range h.Header {
		req.Header[k] = v
	}
	if h.hostOverride != "" {
		req.Host = h.hostOverride
	}

	return h.rt.RoundTrip(req)
}

type SlogWrapper struct {
	slogger slog.Logger
	level   slog.Level
	context context.Context
}

func (wrapper SlogWrapper) Printf(format string, v ...interface{}) {
	str := fmt.Sprintf(format, v)
	wrapper.slogger.Log(wrapper.context, wrapper.level, str)
}

func (cloudConf CloudConfig) ToAwsConfig() (*aws.Config, error) {

	optionFuncs := []func(*config.LoadOptions) error{}
	if len(cloudConf.AwsRegion) > 0 {
		optionFuncs = append(optionFuncs, config.WithRegion(cloudConf.AwsRegion))
	}
	if len(cloudConf.AwsProfile) > 0 {
		optionFuncs = append(optionFuncs, config.WithSharedConfigProfile(cloudConf.AwsProfile))

	}
	if len(cloudConf.AwsAssumeRoleArn) > 0 {
		optionFuncs = append(optionFuncs, config.WithAssumeRoleCredentialOptions(func(options *stscreds.AssumeRoleOptions) {
			options.TokenProvider = func() (string, error) {
				return "theTokenCode", nil
			}
			options.RoleARN = cloudConf.AwsAssumeRoleArn
			options.Duration = time.Duration(1 * time.Hour)
		}))
	}
	cfg, err := config.LoadDefaultConfig(context.TODO(), optionFuncs...)

	return &cfg, err
}

type SearchCredentials struct {
	Username string
	Password string
}

func (conf MaestroConfig) LoadCredentialsFromSecret() (*SearchCredentials, error) {
	cc, err := conf.Cloud.ToAwsConfig()
	if err != nil {
		return nil, err
	}
	sm := secretsmanager.NewFromConfig(*cc)
	sv, err := sm.GetSecretValue(context.TODO(), &secretsmanager.GetSecretValueInput{
		SecretId: &conf.SearchCredentialsArn,
	})
	if err != nil {
		return nil, err
	}
	creds := new(SearchCredentials)
	err = json.Unmarshal([]byte(*sv.SecretString), &creds)
	if err != nil {
		return nil, err
	}
	return creds, nil
}
