package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestResolveMetrics(t *testing.T) {
	mockResponse := `{
		"status": "success",
		"data": {
			"resultType": "matrix",
			"result": [
				{
					"metric": {
						"__name__": "up",
						"job": "prometheus"
					},
					"values": [
						[1716768000, "1"],
						[1716768060, "0"]
					]
				}
			]
		}
	}`

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/v1/query_range" {
			t.Errorf("Expected path /api/v1/query_range, got %s", r.URL.Path)
		}
		if r.URL.Query().Get("query") != "up" {
			t.Errorf("Expected query 'up', got %s", r.URL.Query().Get("query"))
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(mockResponse))
	}))
	defer ts.Close()

	resolver := NewGraphQLResolver(nil, nil, ts.URL)
	vars := map[string]interface{}{
		"query":     "up",
		"startTime": "1716768000",
		"endTime":   "1716768060",
		"step":      float64(60),
	}

	result, err := resolver.resolveMetrics(context.Background(), vars)
	if err != nil {
		t.Fatalf("resolveMetrics failed: %v", err)
	}

	resMap, ok := result.(map[string]interface{})
	if !ok {
		t.Fatalf("Expected map[string]interface{}, got %T", result)
	}

	metrics, ok := resMap["metrics"].([]interface{})
	if !ok || len(metrics) != 1 {
		t.Fatalf("Expected 1 metric result, got %d", len(metrics))
	}

	metric := metrics[0].(map[string]interface{})
	if metric["metricName"] != "up" {
		t.Errorf("Expected metricName 'up', got %v", metric["metricName"])
	}

	labels := metric["labels"].(map[string]interface{})
	if labels["job"] != "prometheus" {
		t.Errorf("Expected label job='prometheus', got %v", labels["job"])
	}

	values := metric["values"].([]interface{})
	if len(values) != 2 {
		t.Fatalf("Expected 2 values, got %d", len(values))
	}

	v1 := values[0].(map[string]interface{})
	if v1["timestamp"] != "1716768000" || v1["value"] != 1.0 {
		t.Errorf("Expected first value to be {1716768000, 1.0}, got %v", v1)
	}

	v2 := values[1].(map[string]interface{})
	if v2["timestamp"] != "1716768060" || v2["value"] != 0.0 {
		t.Errorf("Expected second value to be {1716768060, 0.0}, got %v", v2)
	}
}

func TestResolveMetrics_MissingConfig(t *testing.T) {
	resolver := NewGraphQLResolver(nil, nil, "")
	_, err := resolver.resolveMetrics(context.Background(), nil)
	if err == nil {
		t.Fatal("Expected error for missing URL")
	}
}

func TestResolveMetrics_VMError(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"status": "error",
			"errorType": "bad_data",
			"error": "invalid query",
		})
	}))
	defer ts.Close()

	resolver := NewGraphQLResolver(nil, nil, ts.URL)
	vars := map[string]interface{}{
		"query":     "invalid",
		"startTime": "1716768000",
		"endTime":   "1716768060",
		"step":      float64(60),
	}

	_, err := resolver.resolveMetrics(context.Background(), vars)
	if err == nil {
		t.Fatal("Expected error from VM HTTP 400")
	}
}
