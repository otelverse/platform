//go:build integration

package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	_ "github.com/marcboeker/go-duckdb"
)

func setupTestDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("duckdb", ":memory:")
	if err != nil {
		t.Fatalf("failed to open duckdb: %v", err)
	}
	if err := RunMigrations(db); err != nil {
		t.Fatalf("failed to run migrations: %v", err)
	}
	return db
}

func TestGraphQLIntegration(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	// Insert a test span
	_, err := db.Exec(`
		INSERT INTO otel_traces (TraceId, SpanId, OperationName, ServiceName, StartTime, Duration, StatusCode)
		VALUES ('test-trace-1', 'test-span-1', 'test-operation', 'test-service', NOW(), 1000, 0)
	`)
	if err != nil {
		t.Fatalf("failed to insert test span: %v", err)
	}

	resolver := NewGraphQLResolver(db)

	reqBody := `{"query":"{ traces(limit: 10) { traceId spans { spanId operationName serviceName } } }"}`
	req := httptest.NewRequest("POST", "/graphql", strings.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	resolver.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp GraphQLResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if len(resp.Errors) > 0 {
		t.Fatalf("unexpected errors: %v", resp.Errors)
	}
}

func TestGraphQLIntegrationTraceDetail(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	_, err := db.Exec(`
		INSERT INTO otel_traces (TraceId, SpanId, ParentSpanId, OperationName, ServiceName, StartTime, Duration, StatusCode)
		VALUES ('detail-trace-1', 'span-1', '', 'root', 'svc-a', NOW(), 500, 0)
	`)
	if err != nil {
		t.Fatalf("failed to insert: %v", err)
	}

	resolver := NewGraphQLResolver(db)

	reqBody := `{"query":"query($id: String!) { trace(id: $id) { traceId spans { spanId operationName } } }","variables":{"id":"detail-trace-1"}}`
	req := httptest.NewRequest("POST", "/graphql", strings.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	resolver.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	var resp GraphQLResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	if len(resp.Errors) > 0 {
		t.Fatalf("unexpected errors: %v", resp.Errors)
	}
}
