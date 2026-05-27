package main

import (
	"context"
	"fmt"
	"strings"
)

func (r *GraphQLResolver) resolveLogs(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	limit := 100
	if l, ok := vars["limit"].(float64); ok {
		limit = int(l)
	}

	where := []string{"1=1"}
	args := []interface{}{}

	if svc, ok := vars["serviceName"].(string); ok && svc != "" {
		where = append(where, "ServiceName = ?")
		args = append(args, svc)
	}
	if sev, ok := vars["severity"].(string); ok && sev != "" {
		where = append(where, "SeverityText = ?")
		args = append(args, sev)
	}
	if q, ok := vars["query"].(string); ok && q != "" {
		where = append(where, "Body LIKE ?")
		args = append(args, "%"+q+"%")
	}
	if st, ok := vars["startTime"].(string); ok && st != "" {
		where = append(where, "Timestamp >= ?")
		args = append(args, st)
	}
	if et, ok := vars["endTime"].(string); ok && et != "" {
		where = append(where, "Timestamp <= ?")
		args = append(args, et)
	}

	query := fmt.Sprintf(`
		SELECT toString(Timestamp) as Timestamp, SeverityText, Body, Attributes, TraceId
		FROM otel_logs
		WHERE %s
		ORDER BY Timestamp DESC
		LIMIT %d
	`, strings.Join(where, " AND "), limit)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	var logs []interface{}
	for rows.Next() {
		var timestamp, severity, body, traceId string
		var attrs *string
		if err := rows.Scan(&timestamp, &severity, &body, &attrs, &traceId); err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}
		
		var tId *string
		if traceId != "" {
			tId = &traceId
		}
		
		logs = append(logs, map[string]interface{}{
			"timestamp":  timestamp,
			"severity":   severity,
			"body":       body,
			"attributes": parseAttributes(attrs),
			"traceId":    tId,
		})
	}

	return map[string]interface{}{"logs": logs}, nil
}
