package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	_ "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/otelverse/unified-platform/pipeline"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func TestOptimizerIntegration(t *testing.T) {
	if os.Getenv("INTEGRATION") == "" {
		t.Skip("Set INTEGRATION=1 to run integration tests")
	}

	ctx := context.Background()

	req := testcontainers.ContainerRequest{
		Image:        "clickhouse/clickhouse-server:23.8",
		ExposedPorts: []string{"9000/tcp"},
		WaitingFor:   wait.ForLog("Ready for connections"),
	}

	clickhouseContainer, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		t.Fatalf("failed to start clickhouse: %v", err)
	}
	defer clickhouseContainer.Terminate(ctx)

	port, err := clickhouseContainer.MappedPort(ctx, "9000")
	if err != nil {
		t.Fatalf("failed to get port: %v", err)
	}

	dsn := "clickhouse://localhost:" + port.Port() + "?username=default&password="
	if err := RunMigrations(dsn); err != nil {
		t.Fatalf("migration failed: %v", err)
	}

	db, err := sql.Open("clickhouse", dsn)
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	defer db.Close()

	// Insert mock data for Optimizer
	nowStr := time.Now().Format("2006-01-02 15:04:05")
	
	insertTrace := `
		INSERT INTO otel_traces (TraceId, SpanId, ParentSpanId, OperationName, ServiceName, StartTime, Duration, StatusCode, Attributes, ResourceAttributes)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	traces := []struct {
		traceID, spanID, parentSpanID, opName, svcName string
		startTime                                      string
		duration                                       int64
		statusCode                                     int32
		attrs, resourceAttrs                           string
	}{
		// High error service
		{"t1", "s1", "", "op", "high-error", nowStr, 100000000, 2, `{}`, `{}`},
		{"t2", "s2", "", "op", "high-error", nowStr, 100000000, 2, `{}`, `{}`},
		// High latency service
		{"t3", "s3", "", "op", "high-latency", nowStr, 600000000, 1, `{}`, `{}`},
		// PII service
		{"t4", "s4", "", "op", "pii-service", nowStr, 100000000, 1, `{"email": "user@example.com"}`, `{}`},
	}

	for _, tr := range traces {
		var parentSpanID *string
		if tr.parentSpanID != "" {
			parentSpanID = &tr.parentSpanID
		}
		if _, err := db.ExecContext(ctx, insertTrace,
			tr.traceID, tr.spanID, parentSpanID, tr.opName, tr.svcName,
			tr.startTime, tr.duration, tr.statusCode, tr.attrs, tr.resourceAttrs,
		); err != nil {
			t.Fatalf("insert trace %s: %v", tr.spanID, err)
		}
	}

	resolver := NewGraphQLResolver(db, "http://localhost:8428")

	// 1. Create a Pipeline
	p := resolver.pipelineStore.Create(pipeline.PipelineInput{
		Name: "Test Pipeline",
		Nodes: []pipeline.PipelineNode{
			{ID: "r1", Type: "RECEIVER_OTLP", Label: "OTLP Receiver"},
		},
		Edges: []pipeline.PipelineEdge{},
	})

	startTime := time.Now().Add(-1 * time.Hour).Format(time.RFC3339)
	endTime := time.Now().Add(1 * time.Hour).Format(time.RFC3339)

	// 2. Query Optimization Recommendations
	query := `
		query($pipelineId: ID!, $startTime: DateTime!, $endTime: DateTime!) {
			optimizationRecommendations(pipelineId: $pipelineId, startTime: $startTime, endTime: $endTime) {
				id
				type
				description
			}
		}
	`
	body := `{"query": "` + strings.ReplaceAll(strings.ReplaceAll(query, "\n", " "), "\t", "") + `", "variables": {"pipelineId": "` + p.ID + `", "startTime": "` + startTime + `", "endTime": "` + endTime + `"}}`

	req2 := httptest.NewRequest("POST", "/graphql", strings.NewReader(body))
	req2.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	resolver.ServeHTTP(w, req2)

	res := w.Result()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", res.StatusCode)
	}

	var resp struct {
		Data struct {
			OptimizationRecommendations []struct {
				ID          string
				Type        string
				Description string
			} `json:"optimizationRecommendations"`
		} `json:"data"`
		Errors []string `json:"errors"`
	}

	if err := json.NewDecoder(res.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(resp.Errors) > 0 {
		t.Fatalf("graphql errors: %v", resp.Errors)
	}

	recs := resp.Data.OptimizationRecommendations
	if len(recs) == 0 {
		t.Fatalf("expected recommendations, got 0")
	}

	var hasTailSampling, hasPII bool
	var recID string

	for _, r := range recs {
		if r.Type == "TAIL_SAMPLING" {
			hasTailSampling = true
		}
		if r.Type == "PII_REDACTION" {
			hasPII = true
			recID = r.ID
		}
	}

	if !hasTailSampling {
		t.Errorf("expected TAIL_SAMPLING recommendation")
	}
	if !hasPII {
		t.Errorf("expected PII_REDACTION recommendation")
	}

	// 3. Apply Recommendation
	applyMutation := `
		mutation($pipelineId: ID!, $recommendationId: ID!) {
			applyRecommendation(pipelineId: $pipelineId, recommendationId: $recommendationId) {
				id
				nodes {
					id
					type
				}
			}
		}
	`
	applyBody := `{"query": "` + strings.ReplaceAll(strings.ReplaceAll(applyMutation, "\n", " "), "\t", "") + `", "variables": {"pipelineId": "` + p.ID + `", "recommendationId": "` + recID + `"}}`

	req3 := httptest.NewRequest("POST", "/graphql", strings.NewReader(applyBody))
	req3.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()

	resolver.ServeHTTP(w2, req3)

	if w2.Result().StatusCode != http.StatusOK {
		t.Fatalf("apply failed")
	}

	// Verify pipeline was updated
	updatedP, ok := resolver.pipelineStore.Get(p.ID)
	if !ok {
		t.Fatalf("pipeline not found")
	}

	hasNewNode := false
	for _, n := range updatedP.Nodes {
		if n.Type == "PROCESSOR_ATTRIBUTES" {
			hasNewNode = true
		}
	}

	if !hasNewNode {
		t.Errorf("expected new PROCESSOR_ATTRIBUTES node in pipeline")
	}
}
