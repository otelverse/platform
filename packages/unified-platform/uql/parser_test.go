package uql

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseSimpleTraceQuery(t *testing.T) {
	q, err := NewParser(`traces | where service.name = "api" | limit 10`).Parse()
	require.NoError(t, err)
	assert.Equal(t, QueryTypeTraces, q.Type)
	assert.Len(t, q.Filters, 1)
	assert.Equal(t, "service.name", q.Filters[0].Field)
	assert.Equal(t, OpEqual, q.Filters[0].Operator)
	assert.Equal(t, "api", q.Filters[0].Value)
	assert.Equal(t, 10, q.Limit)
}

func TestParseTraceWithContains(t *testing.T) {
	q, err := NewParser(`traces | where span.name contains "health"`).Parse()
	require.NoError(t, err)
	assert.Equal(t, QueryTypeTraces, q.Type)
	assert.Len(t, q.Filters, 1)
	assert.Equal(t, "span.name", q.Filters[0].Field)
	assert.Equal(t, OpContains, q.Filters[0].Operator)
	assert.Equal(t, "health", q.Filters[0].Value)
	assert.Equal(t, 100, q.Limit)
}

func TestParseLogsQuery(t *testing.T) {
	q, err := NewParser(`logs | where severity = "error" | limit 50`).Parse()
	require.NoError(t, err)
	assert.Equal(t, QueryTypeLogs, q.Type)
	assert.Len(t, q.Filters, 1)
	assert.Equal(t, "severity", q.Filters[0].Field)
	assert.Equal(t, OpEqual, q.Filters[0].Operator)
	assert.Equal(t, "error", q.Filters[0].Value)
	assert.Equal(t, 50, q.Limit)
}

func TestParseLogsWithMessageContains(t *testing.T) {
	q, err := NewParser(`logs | where message contains "timeout" | limit 5`).Parse()
	require.NoError(t, err)
	assert.Equal(t, QueryTypeLogs, q.Type)
	assert.Len(t, q.Filters, 1)
	assert.Equal(t, "message", q.Filters[0].Field)
	assert.Equal(t, OpContains, q.Filters[0].Operator)
	assert.Equal(t, "timeout", q.Filters[0].Value)
	assert.Equal(t, 5, q.Limit)
}

func TestParseMultipleFilters(t *testing.T) {
	q, err := NewParser(`traces | where service.name = "api" | where status.code != "1" | limit 20`).Parse()
	require.NoError(t, err)
	assert.Equal(t, QueryTypeTraces, q.Type)
	assert.Len(t, q.Filters, 2)
	assert.Equal(t, "service.name", q.Filters[0].Field)
	assert.Equal(t, "api", q.Filters[0].Value)
	assert.Equal(t, "status.code", q.Filters[1].Field)
	assert.Equal(t, OpNotEqual, q.Filters[1].Operator)
	assert.Equal(t, "1", q.Filters[1].Value)
	assert.Equal(t, 20, q.Limit)
}

func TestParseDefaultLimit(t *testing.T) {
	q, err := NewParser(`traces | where service.name = "api"`).Parse()
	require.NoError(t, err)
	assert.Equal(t, 100, q.Limit)
}

func TestParseEmptyQueryError(t *testing.T) {
	_, err := NewParser(``).Parse()
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "empty query")
}

func TestParseInvalidTypeError(t *testing.T) {
	_, err := NewParser(`invalid`).Parse()
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "expected 'traces' or 'logs'")
}

func TestParseMissingValueError(t *testing.T) {
	_, err := NewParser(`traces | where service.name =`).Parse()
	assert.Error(t, err)
}

func TestParseInvalidOperatorError(t *testing.T) {
	_, err := NewParser(`traces | where service.name ~ "test"`).Parse()
	assert.Error(t, err)
}

func TestTokenizeQuotedStrings(t *testing.T) {
	q, err := NewParser(`traces | where message = "hello world"`).Parse()
	require.NoError(t, err)
	assert.Equal(t, "hello world", q.Filters[0].Value)
}

func TestParseNoFilters(t *testing.T) {
	q, err := NewParser(`traces | limit 5`).Parse()
	require.NoError(t, err)
	assert.Equal(t, QueryTypeTraces, q.Type)
	assert.Len(t, q.Filters, 0)
	assert.Equal(t, 5, q.Limit)
}

func TestParseSingleQuote(t *testing.T) {
	q, err := NewParser(`traces | where service.name = 'my-service'`).Parse()
	require.NoError(t, err)
	assert.Equal(t, "my-service", q.Filters[0].Value)
}

func TestParseAggregation(t *testing.T) {
	q, err := NewParser(`traces | where service.name = 'api' | by span.name | count`).Parse()
	require.NoError(t, err)
	assert.Equal(t, QueryTypeTraces, q.Type)
	assert.NotNil(t, q.Aggregation)
	assert.Equal(t, "span.name", q.Aggregation.GroupByField)
	assert.Len(t, q.Aggregation.Functions, 1)
	assert.Equal(t, "count", q.Aggregation.Functions[0].Name)
}

func TestParseAggregationMultiple(t *testing.T) {
	q, err := NewParser(`traces | by service.name | avg(duration), p95(duration)`).Parse()
	require.NoError(t, err)
	assert.NotNil(t, q.Aggregation)
	assert.Equal(t, "service.name", q.Aggregation.GroupByField)
	assert.Len(t, q.Aggregation.Functions, 2)
	assert.Equal(t, "avg", q.Aggregation.Functions[0].Name)
	assert.Equal(t, "duration", q.Aggregation.Functions[0].Field)
	assert.Equal(t, "p95", q.Aggregation.Functions[1].Name)
	assert.Equal(t, "duration", q.Aggregation.Functions[1].Field)
}

func TestParseAggregationNoBy(t *testing.T) {
	q, err := NewParser(`traces | p95(duration)`).Parse()
	require.NoError(t, err)
	assert.NotNil(t, q.Aggregation)
	assert.Empty(t, q.Aggregation.GroupByField)
	assert.Len(t, q.Aggregation.Functions, 1)
	assert.Equal(t, "p95", q.Aggregation.Functions[0].Name)
	assert.Equal(t, "duration", q.Aggregation.Functions[0].Field)
}

func TestParseJoin(t *testing.T) {
	q, err := NewParser(`traces | join logs on traceId`).Parse()
	require.NoError(t, err)
	assert.NotNil(t, q.Join)
	assert.Equal(t, QueryTypeLogs, q.Join.TargetSignal)
	assert.Equal(t, "traceId", q.Join.OnField)
}

func TestParseInvalidAggregationSyntax(t *testing.T) {
	_, err := NewParser(`traces | by span.name | avg`).Parse()
	assert.Error(t, err)
}
