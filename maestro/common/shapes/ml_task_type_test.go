package shapes

import "testing"

func TestTaskTypeToJson(t *testing.T) {

	str := LOAD_MODEL.String()
	if str != "LOAD_MODEL" {
		t.Fatalf("%s != LOAD_MODEL", str)
	}

	tt, err := ParseTaskType(str)
	if err != nil {
		t.Fatalf("Error while parsing task type: %s", err)
	}
	if tt != LOAD_MODEL {
		t.Fatalf("%s != LOAD_MODEL", str)
	}
}
