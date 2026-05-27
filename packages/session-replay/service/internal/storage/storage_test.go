package storage

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func TestStorageIntegration(t *testing.T) {
	ctx := context.Background()

	req := testcontainers.ContainerRequest{
		Image:        "postgres:15-alpine",
		ExposedPorts: []string{"5432/tcp"},
		Env: map[string]string{
			"POSTGRES_USER":     "testuser",
			"POSTGRES_PASSWORD": "testpassword",
			"POSTGRES_DB":       "testdb",
		},
		WaitingFor: wait.ForLog("database system is ready to accept connections").WithOccurrence(2).WithStartupTimeout(60 * time.Second),
	}

	postgresC, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		t.Skip("Skipping testcontainers test because Docker is not available")
		return
	}
	defer postgresC.Terminate(ctx)

	host, _ := postgresC.Host(ctx)
	port, _ := postgresC.MappedPort(ctx, "5432")
	dsn := "postgres://testuser:testpassword@" + host + ":" + port.Port() + "/testdb?sslmode=disable"

	store, err := NewStorage(dsn, t.TempDir())
	require.NoError(t, err)

	err = store.SaveEvents(EventPayload{
		SessionID: "session-1",
		Events:    json.RawMessage(`[{"type": 1}]`),
		Timestamp: 1600000000000,
	})
	assert.NoError(t, err)

	events, err := store.GetEvents("session-1")
	assert.NoError(t, err)
	assert.Len(t, events, 1)

	sessions, err := store.ListSessions(10)
	assert.NoError(t, err)
	assert.Len(t, sessions, 1)
	assert.Equal(t, "session-1", sessions[0].SessionID)
}
