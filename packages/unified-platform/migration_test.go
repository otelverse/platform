package main

import (
	"context"
	"database/sql"
	"os"
	"testing"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func TestRunMigrations(t *testing.T) {
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

	var tableCount int
	row := db.QueryRow("SELECT count() FROM system.tables WHERE database = 'default' AND name LIKE 'otel_%'")
	if err := row.Scan(&tableCount); err != nil {
		t.Fatalf("failed to query tables: %v", err)
	}

	if tableCount < 2 {
		t.Fatalf("expected at least 2 otel_ tables, got %d", tableCount)
	}
}
