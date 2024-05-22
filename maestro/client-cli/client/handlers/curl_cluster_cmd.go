package handlers

import (
	"fmt"
	"github.com/HitchPin/maestro/client-cli/client"
	"github.com/MakeNowJust/heredoc"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"os"
	"strings"
)

func CurlClusterCmd() *cobra.Command {

	var hostOverride string
	var method string
	var bodyStr string
	var bodyFile string
	var headersKvps []string
	var verbose bool
	var outFile string

	var catCmd = &cobra.Command{
		Use:   "curl",
		Short: "Call one of the _cat APIs on the cluster.",
		Example: heredoc.Doc(`
			Get node info:
			$ curl /nodes"
		`),
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {

			catPath := args[0]
			mc := cmd.Context().Value("client").(*client.MaestroClient)

			curlReq := client.CurlClusterRequest{
				PathAndQuery: catPath,
				Headers:      map[string]string{},
			}

			var shortBodyDes string
			if cmd.Flags().Lookup("body").Changed {
				curlReq.Body = []byte(bodyStr)
				shortBodyDes = fmt.Sprintf("%v-byte payload", len(curlReq.Body))
			} else if cmd.Flags().Lookup("bodyFile").Changed {
				bodyData, err := os.ReadFile(bodyFile)
				if err != nil {
					return errors.Wrap(err, "Failed to open file for request body.")
				}
				curlReq.Body = bodyData
				shortBodyDes = fmt.Sprintf("%v-byte payload from %s", len(bodyData), bodyFile)
			} else {
				shortBodyDes = "no body"
			}
			if cmd.Flags().Lookup("host").Changed {
				curlReq.HostOverride = &hostOverride
			}

			if cmd.Flags().Lookup("header").Changed {
				for _, s := range headersKvps {
					sParts := strings.Split(s, ":")
					hname := sParts[0]
					hval, _ := strings.CutPrefix(s, hname+":")
					hval = strings.TrimSpace(hval)
					curlReq.Headers[hname] = hval
				}
			}

			if cmd.Flags().Lookup("method").Changed {
				curlReq.Method = method
			} else {
				curlReq.Method = "GET"
			}

			fmt.Printf("Sending request to API Gateway",
				"pathAndQuery", curlReq.PathAndQuery,
				"method", curlReq.Method,
				"body", shortBodyDes,
				"headers", curlReq.Headers,
				"hostOverride", curlReq.HostOverride)

			resp, err := mc.CurlCluster(curlReq)
			if err != nil {
				return err
			}

			if verbose {
				fmt.Printf("Received status code %v %s.\n", resp.StatusCode, resp.StatusText)
				fmt.Printf("Headers:\n")
				for k, v := range resp.Headers {
					fmt.Printf("\t%s: %v\n", k, v)
				}
				fmt.Printf("\n\n")
			}

			if resp.Body == nil {
				return nil
			}

			if cmd.Flags().Lookup("out").Changed {
				err := os.WriteFile(outFile, resp.Body, 0644)
				if err != nil {
					return errors.Wrap(err, "Failed to write response body to file.")
				}
				curlReq.HostOverride = &hostOverride
			} else {
				var contentType string
				if ct, ok := resp.Headers["content-type"]; ok {
					contentType = ct
				} else {
					contentType = "text/plain"
				}
				err = PrintBody(resp.Body, contentType)
				if err != nil {
					return errors.Wrap(err, "Failed to write response body to console.")
				}
			}

			return nil
		},
	}

	catCmd.Flags().StringVarP(&bodyFile, "bodyFile", "f", "", "-f request.json")
	catCmd.Flags().StringVarP(&bodyStr, "body", "d", "", "-d '{\"hi\": \"payload\"}'")
	catCmd.Flags().StringVarP(&hostOverride, "host", "n", "", "-h custom-host:9200")

	catCmd.Flags().StringArrayVarP(&headersKvps, "header", "H", []string{}, "-H 'Content-Type: application/json'")
	catCmd.Flags().StringVarP(&method, "method", "m", "GET", "-m POST")

	catCmd.Flags().BoolVarP(&verbose, "verbose", "v", false, "-v")
	catCmd.Flags().StringVarP(&outFile, "out", "o", "", "-o response.json")
	return catCmd
}
