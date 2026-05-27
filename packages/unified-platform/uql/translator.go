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
		"traceId":         "TraceId",
		"span.id":         "SpanId",
		"spanId":          "SpanId",
		"parent.span.id":  "ParentSpanId",
		"status.code":     "StatusCode",
		"duration":        "Duration",
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

	if q.Aggregation != nil {
		selects := []string{}
		groupBys := []string{}
		
		if q.Aggregation.GroupByField != "" {
			sqlCol, ok := fieldMap[q.Aggregation.GroupByField]
			if !ok {
				sqlCol = q.Aggregation.GroupByField
			}
			selects = append(selects, sqlCol)
			groupBys = append(groupBys, sqlCol)
		}
		
		for _, fn := range q.Aggregation.Functions {
			if fn.Name == "count" {
				selects = append(selects, "count(*) as count")
			} else if fn.Name == "p95" {
				sqlCol, ok := fieldMap[fn.Field]
				if !ok {
					sqlCol = fn.Field
				}
				selects = append(selects, fmt.Sprintf("quantile(0.95)(%s) as p95_%s", sqlCol, strings.ReplaceAll(fn.Field, ".", "_")))
			} else {
				sqlCol, ok := fieldMap[fn.Field]
				if !ok {
					sqlCol = fn.Field
				}
				selects = append(selects, fmt.Sprintf("%s(%s) as %s_%s", fn.Name, sqlCol, fn.Name, strings.ReplaceAll(fn.Field, ".", "_")))
			}
		}
		
		groupByClause := ""
		if len(groupBys) > 0 {
			groupByClause = "GROUP BY " + strings.Join(groupBys, ", ")
		}
		
		query := fmt.Sprintf(`
		SELECT %s
		FROM otel_traces
		WHERE %s
		%s
		LIMIT %d
	`, strings.Join(selects, ", "), strings.Join(where, " AND "), groupByClause, q.Limit)
		
		return query, args, nil
	}

	if q.Join != nil {
		if q.Join.TargetSignal == QueryTypeLogs {
			joinOnField := q.Join.OnField
			sqlJoinCol, ok := fieldMap[joinOnField]
			if !ok {
				sqlJoinCol = joinOnField
			}

			// We prefix trace columns with t. and log columns with l.
			whereWithPrefix := []string{"1=1"}
			for _, w := range where[1:] { // skip the first 1=1
				whereWithPrefix = append(whereWithPrefix, "t."+w)
			}

			query := fmt.Sprintf(`
		SELECT t.TraceId, t.SpanId, t.ParentSpanId, t.OperationName, t.ServiceName,
			toString(t.StartTime) as StartTime, t.Duration, t.StatusCode, t.StatusMessage,
			t.Attributes, t.ResourceAttributes,
			toString(l.Timestamp) as LogTimestamp, l.SeverityText as LogSeverity, l.Body as LogBody, l.Attributes as LogAttributes
		FROM otel_traces t
		LEFT JOIN otel_logs l ON t.%s = l.%s
		WHERE %s
		ORDER BY t.StartTime DESC
		LIMIT %d
	`, sqlJoinCol, sqlJoinCol, strings.Join(whereWithPrefix, " AND "), q.Limit)

			return query, args, nil
		}
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

	if q.Aggregation != nil {
		selects := []string{}
		groupBys := []string{}
		
		if q.Aggregation.GroupByField != "" {
			sqlCol, ok := fieldMap[q.Aggregation.GroupByField]
			if !ok {
				sqlCol = q.Aggregation.GroupByField
			}
			selects = append(selects, sqlCol)
			groupBys = append(groupBys, sqlCol)
		}
		
		for _, fn := range q.Aggregation.Functions {
			if fn.Name == "count" {
				selects = append(selects, "count(*) as count")
			} else if fn.Name == "p95" {
				sqlCol, ok := fieldMap[fn.Field]
				if !ok {
					sqlCol = fn.Field
				}
				selects = append(selects, fmt.Sprintf("quantile(0.95)(%s) as p95_%s", sqlCol, strings.ReplaceAll(fn.Field, ".", "_")))
			} else {
				sqlCol, ok := fieldMap[fn.Field]
				if !ok {
					sqlCol = fn.Field
				}
				selects = append(selects, fmt.Sprintf("%s(%s) as %s_%s", fn.Name, sqlCol, fn.Name, strings.ReplaceAll(fn.Field, ".", "_")))
			}
		}
		
		groupByClause := ""
		if len(groupBys) > 0 {
			groupByClause = "GROUP BY " + strings.Join(groupBys, ", ")
		}
		
		query := fmt.Sprintf(`
		SELECT %s
		FROM otel_logs
		WHERE %s
		%s
		LIMIT %d
	`, strings.Join(selects, ", "), strings.Join(where, " AND "), groupByClause, q.Limit)
		
		return query, args, nil
	}

	query := fmt.Sprintf(`
		SELECT toString(Timestamp) as Timestamp, SeverityText, Body, Attributes, TraceId
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
