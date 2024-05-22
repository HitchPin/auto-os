package client

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"github.com/pkg/errors"
	"io"
	"log/slog"
	"net/http"
	"time"
)

func StreamToByte(stream io.Reader) []byte {
	buf := new(bytes.Buffer)
	buf.ReadFrom(stream)
	return buf.Bytes()
}

func hashBody(bs []byte) (*string, error) {
	var err error
	hash := sha256.New()
	if stream := bytes.NewReader(bs); stream != nil {
		_, err = io.Copy(hash, stream)
		if err != nil {
			return nil, errors.Wrap(err, "Hash computation error")
		}
	}

	str := hex.EncodeToString(hash.Sum(nil))
	return &str, nil
}

func (c MaestroClient) makeReq(method string, path string, body []byte) (*ClientResponse, error) {

	var (
		req      *http.Request
		err      error
		bodyHash string
	)
	if body != nil {
		slog.Info("Sending request with body", "body", string(body))
		req, err = http.NewRequest(method, c.host, bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		h, err := hashBody(body)
		if err != nil {
			return nil, err
		}
		bodyHash = *h
	} else {
		req, err = http.NewRequest(method, c.host, nil)
		bodyHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
	}

	if err != nil {
		return nil, errors.WithStack(err)
	}

	req.URL.Host = c.host
	req.URL.Scheme = "https"
	req.URL.Path = c.basePath + path
	req.URL.Opaque = "//" + c.host + c.basePath + path

	creds, err := c.creds.Retrieve(context.Background())
	if err != nil {
		return nil, errors.WithStack(err)
	}
	err = c.signer.SignHTTP(context.Background(), creds, req, bodyHash, "execute-api", c.region, time.Now())
	if err != nil {
		slog.Error("expect no error, got %v", err)
		return nil, errors.WithStack(err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	body = StreamToByte(resp.Body)
	slog.Info("Sending request with body", "body", string(body))

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, errors.New(fmt.Sprintf("Bad Response Code %s. Body:\n\n%s\n", resp.StatusCode, body))
	}

	return &ClientResponse{
		Status: resp.StatusCode,
		Body:   body,
	}, nil
}
