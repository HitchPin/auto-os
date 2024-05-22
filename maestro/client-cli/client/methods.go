package client

import (
	"encoding/json"
)

type GetRootCAResult struct {
	CertPem    string
	Subject    string
	Expiration string
	Serial     string
}

func (c MaestroClient) GetRootCA() (*GetRootCAResult, error) {
	resp, err := c.makeReq("GET", "/certificates/root", nil)
	if err != nil {
		return nil, err
	}

	result := new(GetRootCAResult)
	err = json.Unmarshal([]byte(resp.Body), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

type IssueCertificateRequest struct {
	Server bool
	Client bool
	Admin  bool
	Name   string
	Usage  string
}
type IssueCertificateResult struct {
	Cert string
	Key  string
}

func (c MaestroClient) IssueCertificate(req IssueCertificateRequest) (*IssueCertificateResult, error) {
	bodyJsonBytes, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}
	bodyJson := []byte(bodyJsonBytes)

	resp, err := c.makeReq("POST", "/certificates/issue", bodyJson)
	if err != nil {
		return nil, err
	}

	result := new(IssueCertificateResult)
	err = json.Unmarshal([]byte(resp.Body), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

type SpecializeOpenSearchConfRequest struct {
	Hostname         string `json:"host"`
	Role             string `json:"role"`
	AvailabilityZone string `json:"az"`
}
type SpecializeOpenSearchConfResult struct {
	PreSecPluginOpenSearchYml string
	FinalOpenSearchYml        string
	InternalUsersYml          string
	SecurityYml               string
	RolesYml                  string
	RolesMappingYml           string
}

func (c MaestroClient) SpecializeOpenSearchConf(req SpecializeOpenSearchConfRequest) (*SpecializeOpenSearchConfResult, error) {
	bodyJsonBytes, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}
	bodyJson := []byte(bodyJsonBytes)

	resp, err := c.makeReq("POST", "/configuration/opensearch", bodyJson)
	if err != nil {
		return nil, err
	}

	result := new(SpecializeOpenSearchConfResult)
	err = json.Unmarshal([]byte(resp.Body), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

type SpecializeCwAgentConfRequest struct {
	Role string `json:"role"`
}
type SpecializeCwAgentConfResult struct {
	AgentConfJson string
}

func (c MaestroClient) SpecializeCwAgentConf(req SpecializeCwAgentConfRequest) (*SpecializeCwAgentConfResult, error) {
	bodyJsonBytes, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}
	bodyJson := []byte(bodyJsonBytes)

	resp, err := c.makeReq("POST", "/configuration/cwagent", bodyJson)
	if err != nil {
		return nil, err
	}

	result := new(SpecializeCwAgentConfResult)
	err = json.Unmarshal([]byte(resp.Body), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

type RegisterInstanceRequest struct {
	InstanceId string `json:"instanceId"`
}
type RegisterInstanceResult struct {
	RegistrationId string
}

func (c MaestroClient) RegisterInstance(req RegisterInstanceRequest) (*RegisterInstanceResult, error) {
	bodyJsonBytes, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}
	bodyJson := []byte(bodyJsonBytes)

	resp, err := c.makeReq("POST", "/register", bodyJson)
	if err != nil {
		return nil, err
	}

	result := new(RegisterInstanceResult)
	err = json.Unmarshal([]byte(resp.Body), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

type CurlClusterRequest struct {
	Method       string            `json:"method"`
	PathAndQuery string            `json:"pathAndQuery"`
	Headers      map[string]string `json:"headers"`
	Body         []byte            `json:"body"`
	HostOverride *string           `json:"hostOverride"`
}
type CurlClusterResult struct {
	Body       []byte            `json:"body"`
	StatusCode int               `json:"statusCode"`
	StatusText string            `json:"statusText"`
	Headers    map[string]string `json:"headers"`
}

func (c MaestroClient) CurlCluster(req CurlClusterRequest) (*CurlClusterResult, error) {
	bodyJsonBytes, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}
	bodyJson := []byte(bodyJsonBytes)

	resp, err := c.makeReq("POST", "/cluster/curl", bodyJson)
	if err != nil {
		return nil, err
	}

	result := new(CurlClusterResult)
	err = json.Unmarshal([]byte(resp.Body), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

type SignalInitFailRequest struct {
	InstanceId   string
	DebugMessage *string
}
type SignalInitFailResult struct {
	EventId string
}

func (c MaestroClient) SignalInitFail(req SignalInitFailRequest) (*SignalInitFailResult, error) {
	bodyJsonBytes, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}
	bodyJson := []byte(bodyJsonBytes)

	resp, err := c.makeReq("POST", "/signal/init-fail", bodyJson)
	if err != nil {
		return nil, err
	}

	result := new(SignalInitFailResult)
	err = json.Unmarshal([]byte(resp.Body), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}
