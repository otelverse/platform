package main

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"testing"

	"github.com/otelverse/unified-platform/uql"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"

	_ "github.com/ClickHouse/clickhouse-go/v2"
)

func TestUQLIntegration(t *testing.T) {
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

	if err := seedTestData(ctx, db); err != nil {
		t.Fatalf("failed to seed test data: %v", err)
	}

	t.Run("UQL traces by service name", func(t *testing.T) {
		parser := uql.NewParser(`traces | where service.name = "api-gateway" | limit 10`)
		query, err := parser.Parse()
		if err != nil {
			t.Fatalf("parse failed: %v", err)
		}

		sqlQuery, args, err := query.ToClickhouse()
		if err != nil {
			t.Fatalf("translation failed: %v", err)
		}

		rows, err := db.QueryContext(ctx, sqlQuery, args...)
		if err != nil {
			t.Fatalf("query failed: %v", err)
		}
		defer rows.Close()

		var count int
		for rows.Next() {
			var traceId, spanId, opName, svcName, startTime string
			var parentSpanID *string
			var duration int64
			var statusCode int32
			var statusMessage *string
			var attrs, resourceAttrs *string
			if err := rows.Scan(&traceId, &spanId, &parentSpanID, &opName,
				&svcName, &startTime, &duration, &statusCode,
				&statusMessage, &attrs, &resourceAttrs); err != nil {
				t.Fatalf("scan failed: %v", err)
			}
			if svcName != "api-gateway" {
				t.Errorf("expected service api-gateway, got %s", svcName)
			}
			count++
		}

		if count == 0 {
			t.Error("expected at least 1 trace, got 0")
		}
	})

	t.Run("UQL traces with contains", func(t *testing.T) {
		parser := uql.NewParser(`traces | where span.name contains "health" | limit 10`)
		query, err := parser.Parse()
		if err != nil {
			t.Fatalf("parse failed: %v", err)
		}

		sqlQuery, args, err := query.ToClickhouse()
		if err != nil {
			t.Fatalf("translation failed: %v", err)
		}

		rows, err := db.QueryContext(ctx, sqlQuery, args...)
		if err != nil {
			t.Fatalf("query failed: %v", err)
		}
		defer rows.Close()

		var count int
		for rows.Next() {
			count++
		}

		if count == 0 {
			t.Error("expected at least 1 trace with healthcheck, got 0")
		}
	})

	t.Run("UQL traces with not equal", func(t *testing.T) {
		parser := uql.NewParser(`traces | where status.code != "0" | limit 10`)
		query, err := parser.Parse()
		if err != nil {
			t.Fatalf("parse failed: %v", err)
		}

		sqlQuery, args, err := query.ToClickhouse()
		if err != nil {
			t.Fatalf("translation failed: %v", err)
		}

		_, err = db.QueryContext(ctx, sqlQuery, args...)
		if err != nil {
			t.Fatalf("query failed: %v", err)
		}
	})

	t.Run("UQL default limit", func(t *testing.T) {
		parser := uql.NewParser(`traces | where service.name = "api-gateway"`)
		query, err := parser.Parse()
		if err != nil {
			t.Fatalf("parse failed: %v", err)
		}

		if query.Limit != 100 {
			t.Errorf("expected default limit 100, got %d", query.Limit)
		}
	})
}

func seedTestData(ctx context.Context, db *sql.DB) error {
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
		{"trace-1", "span-1", "", "GET /api/users", "api-gateway", "2024-01-01T00:00:00.000Z", 100000000, 0, `{"http.method":"GET"}`, `{"service.name":"api-gateway"}`},
		{"trace-1", "span-2", "span-1", "SELECT users", "postgres", "2024-01-01T00:00:00.010Z", 50000000, 0, `{"db.system":"postgresql"}`, `{"service.name":"postgres"}`},
		{"trace-2", "span-3", "", "healthcheck", "api-gateway", "2024-01-01T00:00:01.000Z", 5000000, 0, `{}, ""}`, `{"service.name":"api-gateway"}`},
		{"trace-3", "span-4", "", "POST /api/orders", "payment", "2024-01-01T00:00:02.000Z", 500000000, 1, `{"error":"timeout"}`, `{"service.name":"payment"}`},
	}

	for _, tr := range traces {
		var parentSpanID *string
		if tr.parentSpanID != "" {
			parentSpanID = &tr.parentSpanID
		}
		startTime := tr.startTime
		attrs := tr.attrs
		resourceAttrs := tr.resourceAttrs

		if _, err := db.ExecContext(ctx, insertTrace,
			tr.traceID, tr.spanID, parentSpanID, tr.opName, tr.svcName,
			startTime, tr.duration, tr.statusCode, attrs, resourceAttrs,
		); err != nil {
			return fmt.Errorf("insert trace %s: %w", tr.spanID, err)
		}
	}

	return nil
}
