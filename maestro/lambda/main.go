package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/HitchPin/maestro/actions/util"
	"github.com/HitchPin/maestro/lambda/apis"
	"github.com/aquasecurity/lmdrouter"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/pkg/errors"
)

var router *lmdrouter.Router

func init() {
	router = lmdrouter.NewRouter("", loggerMiddleware)
	router.Route("GET", "/certificates/root", apis.GetRootCaApi)
	router.Route("POST", "/certificates/issue", apis.IssueCertApi)
	router.Route("POST", "/configuration/opensearch", apis.SpecializeOpenSearchApi)
	router.Route("POST", "/configuration/cwagent", apis.SpecializeCloudWatchAgentApi)
	router.Route("POST", "/register", apis.RegisterInstanceApi)
	router.Route("POST", "/cluster/curl", apis.CurlClusterApi)
	router.Route("POST", "/signal/init-fail", apis.SignalInitFailureApi)
}

func main() {
	lambda.Start(HandlerPropsInterceptor)
}

func HandlerPropsInterceptor(
	ctx context.Context,
	req events.APIGatewayProxyRequest,
) (events.APIGatewayProxyResponse, error) {
	cp, err := getCommonProps()
	if err != nil {
		return lmdrouter.HandleError(err)
	}
	newCtx := context.WithValue(ctx, "commonProps", *cp)
	return router.Handler(newCtx, req)
}

func loggerMiddleware(next lmdrouter.Handler) lmdrouter.Handler {
	return func(ctx context.Context, req events.APIGatewayProxyRequest) (
		res events.APIGatewayProxyResponse,
		err error,
	) {
		// [LEVEL] [METHOD PATH] [CODE] EXTRA
		format := "[%s] [%s %s] [%d] %s"
		level := "INF"
		var code int
		var extra string

		res, err = next(ctx, req)
		if err != nil {
			level = "ERR"
			code = http.StatusInternalServerError
			extra = " " + err.Error()
		} else {
			code = res.StatusCode
			if code >= 400 {
				level = "ERR"
			}
		}

		log.Printf(format, level, req.HTTPMethod, req.Path, code, extra)

		return res, err
	}
}

func getCommonProps() (*util.CommonProps, error) {

	awsCfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, errors.Wrap(err, "Unable to load AWS config.")
	}

	c := util.CommonProps{
		AwsConf:                      awsCfg,
		ClusterAdminSecretId:         os.Getenv("CLUSTER_ADMIN_SECRET_ID"),
		CertificateAuthoritySecretId: os.Getenv("ROOT_CA_SECRET_ID"),
		ClusterNameParameterId:       os.Getenv("CLUSTER_NAME_PARAM_NAME"),
		ClusterModeParameterId:       os.Getenv("CLUSTER_MODE_PARAM_NAME"),
		DiscoveryServiceId:           os.Getenv("DISCO_SVC_ID"),
		DiscoveryNamespaceName:       os.Getenv("DISCO_NS_NAME"),
		DiscoveryServiceName:         os.Getenv("DISCO_SVC_NAME"),
		EventBusName:                 os.Getenv("EVENT_BUS_NAME"),
		LbName:                       os.Getenv("LB_NAME"),

		ConfigBucket: os.Getenv("CONF_BUCKET"),
		ConfigPrefix: os.Getenv("CONF_KEY_PREFIX"),
	}

	return &c, nil
}
