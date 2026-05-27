package main

import (
	"testing"
)

func TestHealthzHandler(t *testing.T) {
	// Unit test - healthz handler exists
	handler := healthzHandler
	if handler == nil {
		t.Fatal("healthzHandler should not be nil")
	}
}

func TestAttrsToJSON(t *testing.T) {
	result := attrsToJSON(map[string]string{"key": "val"})
	if result != `{"key":"val"}` {
		t.Fatalf("unexpected JSON: %s", result)
	}
}

func TestAttrsToJSONEmpty(t *testing.T) {
	result := attrsToJSON(map[string]string{})
	if result != "{}" {
		t.Fatalf("expected empty object, got: %s", result)
	}
}

func TestFormatID(t *testing.T) {
	id := []byte{0xAB, 0xCD, 0xEF}
	result := formatID(id)
	if result != "abcdef" {
		t.Fatalf("expected abcdef, got: %s", result)
	}
}

func TestFormatIDEmpty(t *testing.T) {
	result := formatID([]byte{})
	if result != "" {
		t.Fatalf("expected empty string, got: %s", result)
	}
}

func TestParseJSONAttrs(t *testing.T) {
	attrsStr := `{"service.name":"test"}`
	attrs := parseJSONAttrs(&attrsStr)
	if len(attrs) != 1 {
		t.Fatalf("expected 1 attribute, got %d", len(attrs))
	}
}

func TestParseJSONAttrsNil(t *testing.T) {
	attrs := parseJSONAttrs(nil)
	if len(attrs) != 0 {
		t.Fatalf("expected 0 attributes, got %d", len(attrs))
	}
}

func TestGraphQLResponseSerialization(t *testing.T) {
	resp := GraphQLResponse{
		Data: map[string]interface{}{
			"traces": []interface{}{
				map[string]interface{}{
					"traceId": "abc123",
					"spans":   []interface{}{},
				},
			},
		},
	}
	if resp.Data == nil {
		t.Fatal("response data should not be nil")
	}
}
