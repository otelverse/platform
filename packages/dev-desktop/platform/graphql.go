package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type GraphQLResolver struct {
	db *sql.DB
}

type GraphQLRequest struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables"`
}

type GraphQLResponse struct {
	Data   interface{} `json:"data,omitempty"`
	Errors []string    `json:"errors,omitempty"`
}

func NewGraphQLResolver(db *sql.DB) *GraphQLResolver {
	return &GraphQLResolver{db: db}
}

func (r *GraphQLResolver) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	var gqlReq GraphQLRequest
	if err := json.NewDecoder(req.Body).Decode(&gqlReq); err != nil {
		writeGQLError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	result, err := r.executeQuery(req.Context(), gqlReq.Query, gqlReq.Variables)
	if err != nil {
		writeGQLError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(GraphQLResponse{Data: result})
}

func (r *GraphQLResolver) executeQuery(ctx context.Context, query string, vars map[string]interface{}) (interface{}, error) {
	query = strings.TrimSpace(query)

	if strings.Contains(query, "query traces") || strings.Contains(query, "query { traces") {
		return r.resolveTraces(ctx, vars)
	}
	if strings.Contains(query, "query trace(") || strings.Contains(query, "query { trace(") {
		return r.resolveTrace(ctx, vars)
	}
	if strings.Contains(query, "query logs") || strings.Contains(query, "query { logs") {
		return r.resolveLogs(ctx, vars)
	}
	if strings.Contains(query, "pipelines") || strings.Contains(query, "pipeline") {
		return r.resolvePipelines(ctx, vars)
	}

	return nil, fmt.Errorf("unsupported query")
}

func (r *GraphQLResolver) resolveTraces(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
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
	if op, ok := vars["operationName"].(string); ok && op != "" {
		where = append(where, "OperationName = ?")
		args = append(args, op)
	}
	if st, ok := vars["startTime"].(string); ok && st != "" {
		where = append(where, "StartTime >= ?")
		args = append(args, st)
	}
	if et, ok := vars["endTime"].(string); ok && et != "" {
		where = append(where, "StartTime <= ?")
		args = append(args, et)
	}

	query := fmt.Sprintf(`
		SELECT TraceId, SpanId, ParentSpanId, OperationName, ServiceName,
			CAST(StartTime AS VARCHAR) as StartTime, Duration, StatusCode, StatusMessage,
			CAST(Attributes AS VARCHAR) as Attributes,
			CAST(ResourceAttributes AS VARCHAR) as ResourceAttributes
		FROM otel_traces
		WHERE %s
		ORDER BY StartTime DESC
		LIMIT %d
	`, strings.Join(where, " AND "), limit)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	type spanResult struct {
		TraceID            string
		SpanID             string
		ParentSpanID       *string
		OperationName      string
		ServiceName        string
		StartTime          string
		Duration           int64
		StatusCode         int32
		StatusMessage      *string
		Attributes         *string
		ResourceAttributes *string
	}

	var spans []spanResult
	for rows.Next() {
		var s spanResult
		if err := rows.Scan(&s.TraceID, &s.SpanID, &s.ParentSpanID, &s.OperationName,
			&s.ServiceName, &s.StartTime, &s.Duration, &s.StatusCode,
			&s.StatusMessage, &s.Attributes, &s.ResourceAttributes); err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}
		spans = append(spans, s)
	}

	traceMap := make(map[string]map[string]interface{})
	for _, s := range spans {
		traceObj, ok := traceMap[s.TraceID]
		if !ok {
			traceObj = map[string]interface{}{
				"traceId": s.TraceID,
				"spans":   []interface{}{},
			}
			traceMap[s.TraceID] = traceObj
		}
		span := map[string]interface{}{
			"spanId":        s.SpanID,
			"parentSpanId":  s.ParentSpanID,
			"operationName": s.OperationName,
			"serviceName":   s.ServiceName,
			"startTime":     s.StartTime,
			"duration":      s.Duration,
			"statusCode":    s.StatusCode,
			"attributes":    parseJSONAttrs(s.Attributes),
			"events":        []interface{}{},
		}
		traceObj["spans"] = append(traceObj["spans"].([]interface{}), span)
	}

	traces := make([]interface{}, 0, len(traceMap))
	for _, t := range traceMap {
		traces = append(traces, t)
	}

	return map[string]interface{}{"traces": traces}, nil
}

func (r *GraphQLResolver) resolveTrace(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	traceID, _ := vars["id"].(string)
	if traceID == "" {
		return nil, fmt.Errorf("trace id is required")
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT TraceId, SpanId, ParentSpanId, OperationName, ServiceName,
			CAST(StartTime AS VARCHAR) as StartTime, Duration, StatusCode, StatusMessage,
			CAST(Attributes AS VARCHAR) as Attributes
		FROM otel_traces
		WHERE TraceId = ?
		ORDER BY StartTime ASC
	`, traceID)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	var spans []interface{}
	for rows.Next() {
		var (
			traceID, spanID, opName, svcName, startTime string
			parentSpanID                                 *string
			duration                                     int64
			statusCode                                   int32
			statusMessage                                *string
			attrs                                        *string
		)
		if err := rows.Scan(&traceID, &spanID, &parentSpanID, &opName,
			&svcName, &startTime, &duration, &statusCode,
			&statusMessage, &attrs); err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}
		spans = append(spans, map[string]interface{}{
			"spanId":        spanID,
			"parentSpanId":  parentSpanID,
			"operationName": opName,
			"serviceName":   svcName,
			"startTime":     startTime,
			"duration":      duration,
			"statusCode":    statusCode,
			"attributes":    parseJSONAttrs(attrs),
			"events":        []interface{}{},
		})
	}

	if len(spans) == 0 {
		return map[string]interface{}{"trace": nil}, nil
	}

	return map[string]interface{}{
		"trace": map[string]interface{}{
			"traceId": traceID,
			"spans":   spans,
		},
	}, nil
}

func (r *GraphQLResolver) resolveLogs(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	limit := 100
	if l, ok := vars["limit"].(float64); ok {
		limit = int(l)
	}

	where := []string{"1=1"}
	args := []interface{}{}

	if sev, ok := vars["severity"].(string); ok && sev != "" {
		where = append(where, "SeverityText = ?")
		args = append(args, sev)
	}
	if msg, ok := vars["message"].(string); ok && msg != "" {
		where = append(where, "Body LIKE ?")
		args = append(args, "%"+msg+"%")
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
		SELECT CAST(Timestamp AS VARCHAR) as Timestamp, SeverityText, Body,
			CAST(Attributes AS VARCHAR) as Attributes
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
		var timestamp, severity, body string
		var attrs *string
		if err := rows.Scan(&timestamp, &severity, &body, &attrs); err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}
		logs = append(logs, map[string]interface{}{
			"timestamp":  timestamp,
			"severity":   severity,
			"body":       body,
			"attributes": parseJSONAttrs(attrs),
		})
	}

	return map[string]interface{}{"logs": logs}, nil
}

func (r *GraphQLResolver) resolvePipelines(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	return map[string]interface{}{"pipelines": []interface{}{}}, nil
}

func parseJSONAttrs(attrs *string) []interface{} {
	if attrs == nil || *attrs == "" || *attrs == "{}" {
		return []interface{}{}
	}
	var raw map[string]string
	if err := json.Unmarshal([]byte(*attrs), &raw); err != nil {
		return []interface{}{}
	}
	result := make([]interface{}, 0, len(raw))
	for k, v := range raw {
		result = append(result, map[string]string{"key": k, "value": v})
	}
	return result
}

func writeGQLError(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(GraphQLResponse{Errors: []string{msg}})
}

func nowPtr() *time.Time {
	t := time.Now()
	return &t
}
