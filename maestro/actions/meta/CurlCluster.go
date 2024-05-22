package meta

import (
	"bytes"
	"crypto/tls"
	"crypto/x509"
	"github.com/HitchPin/maestro/actions/conf"
	"github.com/HitchPin/maestro/actions/util"
	"github.com/pkg/errors"
	"io"
	"net/http"
	"net/url"
	"strings"
)

type CurlClusterInput struct {
	CommonProps  util.CommonProps
	Method       string
	PathAndQuery string
	Headers      map[string]string
	Body         []byte
	HostOverride *string
}
type CurlClusterOutput struct {
	Body       []byte
	StatusCode int
	StatusText string
	Headers    map[string]string
}

func CurlCluster(input CurlClusterInput) (*CurlClusterOutput, error) {

	prefixed := input.PathAndQuery
	if !strings.HasPrefix(prefixed, "/") {
		prefixed = "/" + prefixed
	}

	httpClient := &http.Client{

		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
				VerifyPeerCertificate: func(rawCerts [][]byte, verifiedChains [][]*x509.Certificate) error {
					return nil
				},
			},
		},
	}

	var dnsName string
	if input.HostOverride != nil {
		dnsName = *input.HostOverride
	} else {
		lbHost, err := util.GetDnsNameForLb(input.CommonProps.AwsConf, input.CommonProps.LbName)
		if err != nil {
			return nil, errors.Wrap(err, "Failed to determine DNS name for load balancer.")
		}
		dnsName = *lbHost
	}

	var req *http.Request
	adminPass, err := conf.GetClusterAdminPwd(input.CommonProps.AwsConf, input.CommonProps.ClusterAdminSecretId)
	if err != nil {
		return nil, errors.Wrap(err, "Failed to get cluster admin pwd.")
	}
	fullUrlStr := "https://" + dnsName + prefixed
	fullUrl, err := url.ParseRequestURI(fullUrlStr)
	if err != nil {
		return nil, err
	}

	headers := newHeaderMap(input.Headers)
	if input.Body != nil {
		req, err = http.NewRequest(input.Method, fullUrl.String(), bytes.NewReader(input.Body))
		contentType := headers.GetOrDefault("content-type", "application/json")
		req.Header.Set("content-type", contentType)
	} else {
		req, err = http.NewRequest(input.Method, fullUrl.String(), nil)
		req.Header.Set("content-type", "application/json")
	}
	req.SetBasicAuth(adminPass.Username, adminPass.Password)

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	response, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	r := CurlClusterOutput{
		Body:       response,
		StatusCode: resp.StatusCode,
		StatusText: resp.Status,
		Headers:    toSingleValuedHeaderMap(resp.Header),
	}
	return &r, nil
}
