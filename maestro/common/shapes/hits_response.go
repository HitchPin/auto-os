package shapes

type SearchHit struct {
	Source map[string]interface{} `json:"_source"`
	Id     string                 `json:"_id"`
}

type HitsResponse struct {
	Hits []SearchHit `json:"hits"`
}

type SearchResponse struct {
	Hits *HitsResponse `json:"hits"`
}
