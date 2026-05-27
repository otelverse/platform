package uql

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestTranslateTracesQuery(t *testing.T) {
	q, err := NewParser(`traces | where service.name = "api" | limit 10`).Parse()
	require.NoError(t, err)

	sql, args, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.Contains(t, sql, "FROM otel_traces")
	assert.Contains(t, sql, "ServiceName = ?")
	assert.Contains(t, sql, "LIMIT 10")
	assert.Equal(t, []interface{}{"api"}, args)
}

func TestTranslateTracesContains(t *testing.T) {
	q, err := NewParser(`traces | where span.name contains "health"`).Parse()
	require.NoError(t, err)

	sql, args, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.Contains(t, sql, "FROM otel_traces")
	assert.Contains(t, sql, "OperationName LIKE ?")
	assert.Equal(t, []interface{}{"%health%"}, args)
}

func TestTranslateLogsQuery(t *testing.T) {
	q, err := NewParser(`logs | where severity = "error" | limit 50`).Parse()
	require.NoError(t, err)

	sql, args, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.Contains(t, sql, "FROM otel_logs")
	assert.Contains(t, sql, "SeverityText = ?")
	assert.Contains(t, sql, "LIMIT 50")
	assert.Equal(t, []interface{}{"error"}, args)
}

func TestTranslateLogsMessageContains(t *testing.T) {
	q, err := NewParser(`logs | where message contains "timeout" | limit 5`).Parse()
	require.NoError(t, err)

	sql, args, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.Contains(t, sql, "FROM otel_logs")
	assert.Contains(t, sql, "Body LIKE ?")
	assert.Equal(t, []interface{}{"%timeout%"}, args)
}

func TestTranslateMultipleFilters(t *testing.T) {
	q, err := NewParser(`traces | where service.name = "api" | where status.code != "0" | limit 20`).Parse()
	require.NoError(t, err)

	sql, args, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.Contains(t, sql, "ServiceName = ?")
	assert.Contains(t, sql, "StatusCode != ?")
	assert.Contains(t, sql, "AND")
	assert.Equal(t, []interface{}{"api", "0"}, args)
}

func TestTranslateDefaultLimit(t *testing.T) {
	q, err := NewParser(`traces | where service.name = "api"`).Parse()
	require.NoError(t, err)

	sql, _, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.Contains(t, sql, "LIMIT 100")
}

func TestTranslateNoFilters(t *testing.T) {
	q, err := NewParser(`traces | limit 5`).Parse()
	require.NoError(t, err)

	sql, args, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.Contains(t, sql, "FROM otel_traces")
	assert.Contains(t, sql, "1=1")
	assert.Contains(t, sql, "LIMIT 5")
	assert.Empty(t, args)
}

func TestTranslateAllSelectColumns(t *testing.T) {
	q, err := NewParser(`traces | limit 1`).Parse()
	require.NoError(t, err)

	sql, _, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.True(t, strings.Contains(sql, "TraceId"))
	assert.True(t, strings.Contains(sql, "SpanId"))
	assert.True(t, strings.Contains(sql, "OperationName"))
	assert.True(t, strings.Contains(sql, "ServiceName"))
}

func TestTranslateLogsSelectColumns(t *testing.T) {
	q, err := NewParser(`logs | limit 1`).Parse()
	require.NoError(t, err)

	sql, _, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.True(t, strings.Contains(sql, "Timestamp"))
	assert.True(t, strings.Contains(sql, "SeverityText"))
	assert.True(t, strings.Contains(sql, "Body"))
}

func TestTranslateAggregationCount(t *testing.T) {
	q, err := NewParser(`traces | where service.name = "api" | by span.name | count`).Parse()
	require.NoError(t, err)

	sql, args, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.Contains(t, sql, "SELECT OperationName, count(*) as count")
	assert.Contains(t, sql, "FROM otel_traces")
	assert.Contains(t, sql, "WHERE 1=1 AND ServiceName = ?")
	assert.Contains(t, sql, "GROUP BY OperationName")
	assert.Equal(t, []interface{}{"api"}, args)
}

func TestTranslateAggregationMultipleFunctions(t *testing.T) {
	q, err := NewParser(`traces | by service.name | avg(duration), p95(duration)`).Parse()
	require.NoError(t, err)

	sql, _, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.Contains(t, sql, "SELECT ServiceName, avg(Duration) as avg_duration, quantile(0.95)(Duration) as p95_duration")
	assert.Contains(t, sql, "GROUP BY ServiceName")
}

func TestTranslateAggregationNoBy(t *testing.T) {
	q, err := NewParser(`traces | count`).Parse()
	require.NoError(t, err)

	sql, _, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.Contains(t, sql, "SELECT count(*) as count")
	assert.NotContains(t, sql, "GROUP BY")
}

func TestTranslateJoin(t *testing.T) {
	q, err := NewParser(`traces | where service.name = "api" | join logs on traceId`).Parse()
	require.NoError(t, err)

	sql, args, err := q.ToClickhouse()
	require.NoError(t, err)
	assert.Contains(t, sql, "SELECT t.TraceId, t.SpanId, t.ParentSpanId, t.OperationName, t.ServiceName")
	assert.Contains(t, sql, "toString(l.Timestamp) as LogTimestamp, l.SeverityText as LogSeverity, l.Body as LogBody, l.Attributes as LogAttributes")
	assert.Contains(t, sql, "FROM otel_traces t")
	assert.Contains(t, sql, "LEFT JOIN otel_logs l ON t.TraceId = l.TraceId")
	assert.Contains(t, sql, "WHERE 1=1 AND t.ServiceName = ?")
	assert.Equal(t, []interface{}{"api"}, args)
}
