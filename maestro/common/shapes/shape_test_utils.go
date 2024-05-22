package shapes

import (
	"encoding/json"
	"reflect"
	"testing"
)

func assertJsonEqual(t *testing.T, a string, b string) {
	var err error
	ai := map[string]interface{}{}
	bi := map[string]interface{}{}
	err = json.Unmarshal([]byte(a), &ai)
	if err != nil {
		t.Fatalf("Could not unmarshal string '%s' to interface.", a)
	}
	err = json.Unmarshal([]byte(b), &bi)
	if err != nil {
		t.Fatalf("Could not unmarshal string '%s' to interface.", b)
	}

	if !reflect.DeepEqual(ai, bi) {
		t.Fatalf("%s != %s", a, b)
	}
}
