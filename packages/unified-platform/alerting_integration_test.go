package main

import (
	"context"
	"database/sql"
	"fmt"
	"testing"
	"time"

	"github.com/otelverse/unified-platform/alerting"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

type mockNotifier struct {
	sent int
}

func (m *mockNotifier) SendNotification(channel alerting.NotificationChannel, rule alerting.AlertRule, event alerting.AlertEvent) error {
	m.sent++
	return nil
}

func TestAlertingIntegration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()
	req := testcontainers.ContainerRequest{
		Image:        "clickhouse/clickhouse-server:23.8",
		ExposedPorts: []string{"9000/tcp"},
		WaitingFor:   wait.ForLog("Ready for connections."),
	}
	chContainer, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		t.Fatalf("failed to start container: %s", err)
	}
	defer chContainer.Terminate(ctx)

	host, _ := chContainer.Host(ctx)
	port, _ := chContainer.MappedPort(ctx, "9000")
	dsn := fmt.Sprintf("clickhouse://%s:%s?username=default&password=", host, port.Port())

	db, err := sql.Open("clickhouse", dsn)
	if err != nil {
		t.Fatalf("failed to connect to db: %v", err)
	}
	defer db.Close()

	if err := RunMigrations(dsn); err != nil {
		t.Fatalf("failed to run migrations: %v", err)
	}

	// Insert dummy data
	_, err = db.ExecContext(ctx, `
		INSERT INTO otel_traces (TraceId, SpanId, StartTime, Duration, ServiceName, OperationName, StatusCode)
		VALUES
		('trace1', 'span1', now(), 100, 'auth-service', 'login', 2),
		('trace2', 'span2', now(), 150, 'auth-service', 'login', 2),
		('trace3', 'span3', now(), 200, 'auth-service', 'login', 2)
	`)
	if err != nil {
		t.Fatalf("failed to insert data: %v", err)
	}

	// Wait for clickhouse to ingest
	time.Sleep(2 * time.Second)

	resolver := NewGraphQLResolver(db, "http://localhost:8428")
	store := resolver.alertStore

	// Add test notifier logic by making a custom struct that records
	// Since resolver has its own internal evaluator instantiated inside StartBackgroundTasks,
	// we will manually run the evaluator logic or inject a mock notifier.
	
	mn := &mockNotifier{}
	
	eval := alerting.NewEvaluator(store, db, mn)
	rule := store.CreateRule(alerting.AlertRule{
		Name:            "High Errors",
		Query:           "FIND traces WHERE status.code = 2",
		IntervalSeconds: 60,
		Condition: map[string]interface{}{
			"type":      "COUNT_GT",
			"threshold": float64(2),
		},
		NotificationChannelIDs: []string{},
	})

	// Evaluate
	eval.EvaluateAll(ctx) // exported for testing

	updatedRule, _ := store.GetRule(rule.ID)
	if updatedRule.State != "ALERTING" {
		t.Fatalf("Expected ALERTING, got %s", updatedRule.State)
	}
}
