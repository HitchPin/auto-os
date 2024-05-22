package shapes

import (
	"reflect"
	"testing"
	"time"
)

var CreateTime = time.UnixMilli(1713971055123)
var UpdateTime = time.UnixMilli(1716581055123)
var ExpectedMLTask = MLTask{
	TaskId:       "123",
	ModelId:      "abc",
	TaskType:     LOAD_MODEL,
	FunctionName: "func1",
	State:        COMPLETED,
	InputType:    TEXT_SIMILARITY,
	Progress:     50.5,
	OutputIndex:  "asdf",
	WorkerNodes: []string{
		"node1", "node2",
	},
	CreateTime:     CreateTime,
	LastUpdateTime: UpdateTime,
	Error:          "An error happened",
	IsAsync:        true,
}

const ExpectedMLTaskJson = `
{
    "task_id": "123",
    "model_id": "abc",
    "task_type": "LOAD_MODEL",
    "function_name": "func1",
    "state": "COMPLETED",
    "input_type": "TEXT_SIMILARITY",
    "progress": 50.5,
    "output_index": "asdf",
    "worker_node": [
        "node1",
        "node2"
    ],
    "create_time": 1713971055123,
    "last_update_time": 1716581055123,
    "error": "An error happened",
    "async": true
}
`

const IncompleteMLTaskJson = `
{
    "task_type": "REGISTER_MODEL",
    "function_name": "TEXT_EMBEDDING",
    "state": "CREATED",
    "worker_node": [
        "jsPhpgDwQm-fwIHaOLEJzQ"
    ],
    "create_time": 1713953370804,
    "last_update_time": 1713953370804,
    "is_async": true
}
`

func TestMLTaskFromJson(t *testing.T) {
	unmarshalled := new(MLTask)
	err := ParseMLTask(ExpectedMLTaskJson, unmarshalled)
	if err != nil {
		t.Fatalf("Failed to unmarshal json into MLTask: %s", err)
	}

	if !reflect.DeepEqual(ExpectedMLTask, *unmarshalled) {
		t.Fatalf("Unmarshalled MLTasks do not match.")
	}
}

func TestMLTaskToJson(t *testing.T) {

	str, err := ExpectedMLTask.ToJson()
	if err != nil {
		t.Fatal("Could not convert MLTask to JSON.")
	}

	assertJsonEqual(t, str, ExpectedMLTaskJson)
}

func TestMLTaskParsesIncompleteJson(t *testing.T) {

	unmarshalled := new(MLTask)
	err := ParseMLTask(IncompleteMLTaskJson, unmarshalled)
	if err != nil {
		t.Fatalf("Failed to unmarshal json into MLTask: %s", err)
	}

}
