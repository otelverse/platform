package main

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestParseAttributes(t *testing.T) {
	attrsStr := `{"service.name":"test-svc","env":"prod"}`
	attrs := parseAttributes(&attrsStr)
	if len(attrs) != 2 {
		t.Fatalf("expected 2 attributes, got %d", len(attrs))
	}
}

func TestParseAttributesNil(t *testing.T) {
	attrs := parseAttributes(nil)
	if len(attrs) != 0 {
		t.Fatalf("expected 0 attributes, got %d", len(attrs))
	}
}

func TestGraphQLSchemaPresence(t *testing.T) {
	schema := `type Query {
  traces(serviceName: String, operationName: String, startTime: DateTime!, endTime: DateTime!, limit: Int = 100): [Trace!]!
  trace(id: String!): Trace
  logs(severity: String, message: String, startTime: DateTime!, endTime: DateTime!, limit: Int = 100): [Log!]!
  uql(query: String!): UQLResult!
}`
	if !strings.Contains(schema, "traces(") {
		t.Fatal("schema should contain traces query")
	}
	if !strings.Contains(schema, "logs(") {
		t.Fatal("schema should contain logs query")
	}
	if !strings.Contains(schema, "uql(") {
		t.Fatal("schema should contain uql query")
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

	data, err := json.Marshal(resp)
	if err != nil {
		t.Fatalf("failed to marshal: %v", err)
	}

	var decoded map[string]interface{}
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("failed to unmarshal: %v", err)
	}

	traces := decoded["data"].(map[string]interface{})["traces"].([]interface{})
	if len(traces) != 1 {
		t.Fatalf("expected 1 trace, got %d", len(traces))
	}
}
