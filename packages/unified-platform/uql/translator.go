package uql

import (
	"fmt"
	"strings"
)

// ToClickhouse translates a parsed UQL query into a ClickHouse SQL query.
func (q *Query) ToClickhouse() (string, []interface{}, error) {
	fieldMap := map[string]string{
		"service.name":    "ServiceName",
		"span.name":       "OperationName",
		"operation.name":  "OperationName",
		"trace.id":        "TraceId",
		"span.id":         "SpanId",
		"parent.span.id":  "ParentSpanId",
		"status.code":     "StatusCode",
		"severity":        "SeverityText",
		"severity.text":   "SeverityText",
		"message":         "Body",
		"body":            "Body",
	}

	switch q.Type {
	case QueryTypeTraces:
		return q.buildTraceQuery(fieldMap)
	case QueryTypeLogs:
		return q.buildLogQuery(fieldMap)
	default:
		return "", nil, fmt.Errorf("unknown query type")
	}
}

func (q *Query) buildTraceQuery(fieldMap map[string]string) (string, []interface{}, error) {
	where := []string{"1=1"}
	args := []interface{}{}

	for _, f := range q.Filters {
		sqlCol, ok := fieldMap[f.Field]
		if !ok {
			// Try direct column name
			sqlCol = f.Field
		}

		clause, arg, err := buildWhereClause(sqlCol, f.Operator, f.Value)
		if err != nil {
			return "", nil, fmt.Errorf("filter on '%s': %w", f.Field, err)
		}
		where = append(where, clause)
		args = append(args, arg)
	}

	query := fmt.Sprintf(`
		SELECT TraceId, SpanId, ParentSpanId, OperationName, ServiceName,
			toString(StartTime) as StartTime, Duration, StatusCode, StatusMessage,
			Attributes, ResourceAttributes
		FROM otel_traces
		WHERE %s
		ORDER BY StartTime DESC
		LIMIT %d
	`, strings.Join(where, " AND "), q.Limit)

	return query, args, nil
}

func (q *Query) buildLogQuery(fieldMap map[string]string) (string, []interface{}, error) {
	where := []string{"1=1"}
	args := []interface{}{}

	for _, f := range q.Filters {
		sqlCol, ok := fieldMap[f.Field]
		if !ok {
			sqlCol = f.Field
		}

		clause, arg, err := buildWhereClause(sqlCol, f.Operator, f.Value)
		if err != nil {
			return "", nil, fmt.Errorf("filter on '%s': %w", f.Field, err)
		}
		where = append(where, clause)
		args = append(args, arg)
	}

	query := fmt.Sprintf(`
		SELECT toString(Timestamp) as Timestamp, SeverityText, Body, Attributes
		FROM otel_logs
		WHERE %s
		ORDER BY Timestamp DESC
		LIMIT %d
	`, strings.Join(where, " AND "), q.Limit)

	return query, args, nil
}

func buildWhereClause(column string, op Operator, value string) (string, interface{}, error) {
	switch op {
	case OpEqual:
		return fmt.Sprintf("%s = ?", column), value, nil
	case OpNotEqual:
		return fmt.Sprintf("%s != ?", column), value, nil
	case OpContains:
		return fmt.Sprintf("%s LIKE ?", column), "%"+value+"%", nil
	default:
		return "", nil, fmt.Errorf("unsupported operator '%s'", op)
	}
}
