package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func TestMetricsIntegration_VictoriaMetrics(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	ctx := context.Background()

	// Start VictoriaMetrics container
	req := testcontainers.ContainerRequest{
		Image:        "victoriametrics/victoria-metrics:v1.93.0",
		ExposedPorts: []string{"8428/tcp"},
		WaitingFor:   wait.ForHTTP("/health").WithPort("8428/tcp").WithStartupTimeout(60 * time.Second),
	}

	vmContainer, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		t.Fatalf("Failed to start VictoriaMetrics container: %v", err)
	}
	defer vmContainer.Terminate(ctx)

	host, err := vmContainer.Host(ctx)
	if err != nil {
		t.Fatalf("Failed to get VM host: %v", err)
	}
	port, err := vmContainer.MappedPort(ctx, "8428")
	if err != nil {
		t.Fatalf("Failed to get VM port: %v", err)
	}

	vmURL := fmt.Sprintf("http://%s:%s", host, port.Port())

	// Insert some dummy data using Prometheus exposition format
	ingestURL := fmt.Sprintf("%s/api/v1/import/prometheus", vmURL)
	payload := `
my_custom_metric{label="test"} 42.0
my_custom_metric{label="test"} 43.0
`
	resp, err := http.Post(ingestURL, "text/plain", strings.NewReader(payload))
	if err != nil {
		t.Fatalf("Failed to ingest data: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("Expected 204 No Content for ingest, got %d", resp.StatusCode)
	}

	// Wait a moment for data to be searchable
	time.Sleep(1 * time.Second)

	// Test GraphQL Resolver
	resolver := NewGraphQLResolver(nil, nil, vmURL)

	now := time.Now().Unix()
	vars := map[string]interface{}{
		"query":     "my_custom_metric",
		"startTime": fmt.Sprintf("%d", now-3600), // 1 hour ago
		"endTime":   fmt.Sprintf("%d", now+3600), // 1 hour future
		"step":      float64(60),
	}

	result, err := resolver.resolveMetrics(ctx, vars)
	if err != nil {
		t.Fatalf("resolveMetrics failed: %v", err)
	}

	resMap, ok := result.(map[string]interface{})
	if !ok {
		t.Fatalf("Expected map[string]interface{}, got %T", result)
	}

	metrics, ok := resMap["metrics"].([]interface{})
	if !ok || len(metrics) == 0 {
		t.Fatalf("Expected metrics array with length > 0, got %d", len(metrics))
	}

	// Verify we got our metric back
	metricStr, _ := json.Marshal(metrics[0])
	if !strings.Contains(string(metricStr), "my_custom_metric") {
		t.Errorf("Expected metric string to contain my_custom_metric, got: %s", string(metricStr))
	}
}
