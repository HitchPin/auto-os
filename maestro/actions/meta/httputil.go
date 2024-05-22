package meta

import (
	"net/http"
	"strings"
)

type HeaderMap struct {
	underlyingMap map[string]string
}

func newHeaderMap(headers map[string]string) HeaderMap {

	lcaseMap := map[string]string{}
	for k, v := range headers {
		lcaseMap[strings.ToLower(k)] = v
	}
	return HeaderMap{
		lcaseMap,
	}
}

func (hm HeaderMap) Get(headerName string) *string {
	if hval, ok := hm.underlyingMap[strings.ToLower(headerName)]; ok {
		return &hval
	}
	return nil
}

func (hm HeaderMap) GetOrDefault(headerName string, defaultValue string) string {
	if hval, ok := hm.underlyingMap[strings.ToLower(headerName)]; ok {
		return hval
	}
	return defaultValue
}

func (hm HeaderMap) CopyToReq(httpReq *http.Request) {
	for k, v := range hm.underlyingMap {
		httpReq.Header.Set(k, v)
	}
}

func toSingleValuedHeaderMap(header http.Header) map[string]string {
	m := map[string]string{}
	for k, v := range header {
		joined := strings.Join(v, "\n")
		m[k] = joined
	}
	return m
}
