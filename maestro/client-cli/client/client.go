package client

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"net/http"
	"net/url"
	"strings"
)

type MaestroClient struct {
	host       string
	basePath   string
	creds      aws.CredentialsProvider
	signer     v4.Signer
	region     string
	httpClient http.Client
}

func createMaestroClient(creds aws.CredentialsProvider, region string, endpoint string) MaestroClient {
	signer := v4.NewSigner(func(signer *v4.SignerOptions) {
		signer.DisableURIPathEscaping = true
	})
	uri, err := url.ParseRequestURI(endpoint)
	if err != nil {
		panic(err)
	}
	p := strings.TrimRight(uri.Path, "/")

	client := &http.Client{}

	return MaestroClient{
		host:       uri.Host,
		basePath:   p,
		signer:     *signer,
		creds:      creds,
		region:     region,
		httpClient: *client,
	}
}

type ClientResponse struct {
	Status int
	Body   []byte
}
