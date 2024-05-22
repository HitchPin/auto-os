package shapes

import (
	"reflect"
	"testing"
)

var PipelineDescription = "A search pipeline"
var ExpectedSearchPipeline = SearchPipeline{
	Description: &PipelineDescription,
	PhaseResultsProcessors: []PhaseResultProcessor{
		NormalizationProcessor{
			Combination: Combination{
				Technique: ArithmeticMean,
				Parameters: CombinationParameters{
					Weights: []float32{
						0.4,
						0.3,
						0.3,
					},
				},
			},
			Normalization: Normalization{
				Technique: MIN_MAX,
			},
		},
	},
}

const ExpectedPipelineJson = `
{
    "description": "A search pipeline",
    "phase_results_processors": [
		{
			"normalization-processor": {
				"normalization": {
					"technique": "min_max"
				},
				"combination": {
					"technique": "arithmetic_mean",
					"parameters": {
						"weights": [ 0.4, 0.3, 0.3 ]
					}
				}
			}
		}
	]
}
`

func TestSearchPipelineFromJson(t *testing.T) {
	unmarshalled := new(SearchPipeline)
	err := ParseSearchPipeline(ExpectedPipelineJson, unmarshalled)
	if err != nil {
		t.Fatalf("Failed to unmarshal json into MLTask: %s", err)
	}

	if !reflect.DeepEqual(ExpectedSearchPipeline, *unmarshalled) {
		t.Fatalf("Unmarshalled Search Pipelines do not match.")
	}
}

func TestSearchPipelineToJson(t *testing.T) {

	str, err := ExpectedSearchPipeline.ToJson()
	if err != nil {
		t.Fatal("Could not convert SearchPipeline to JSON.")
	}

	assertJsonEqual(t, str, ExpectedPipelineJson)
}
