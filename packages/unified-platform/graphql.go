package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/otelverse/unified-platform/alerting"
	"github.com/otelverse/unified-platform/optimizer"
	"github.com/otelverse/unified-platform/pipeline"
	"github.com/otelverse/unified-platform/uql"
)

type GraphQLResolver struct {
	db            *sql.DB
	pipelineStore *pipeline.Store
	chaosStore         *ChaosStore
	alertStore         *alerting.Store
	victoriaMetricsURL string
}

type TracesQuery struct {
	ServiceName   string `json:"serviceName"`
	OperationName string `json:"operationName"`
	StartTime     string `json:"startTime"`
	EndTime       string `json:"endTime"`
	Limit         int    `json:"limit"`
}

type LogsQuery struct {
	Severity  string `json:"severity"`
	Message   string `json:"message"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	Limit     int    `json:"limit"`
}

type GraphQLRequest struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables"`
}

type GraphQLResponse struct {
	Data   interface{} `json:"data,omitempty"`
	Errors []string    `json:"errors,omitempty"`
}

func NewGraphQLResolver(db *sql.DB, vmURL string) *GraphQLResolver {
	return &GraphQLResolver{
		db:                 db,
		pipelineStore:      pipeline.NewStore(),
		chaosStore:         NewChaosStore(),
		alertStore:         alerting.NewStore(),
		victoriaMetricsURL: vmURL,
	}
}

func (r *GraphQLResolver) StartBackgroundTasks(ctx context.Context) {
	evaluator := alerting.NewEvaluator(r.alertStore, r.db, alerting.NewNotifier(r.alertStore))
	evaluator.Start(ctx)
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

	if strings.HasPrefix(query, "mutation") {
		return r.resolveMutation(ctx, query, vars)
	}

	if strings.Contains(query, "query traces") || strings.Contains(query, "query { traces") {
		return r.resolveTraces(ctx, vars)
	}
	if strings.Contains(query, "query trace(") || strings.Contains(query, "query { trace(") {
		return r.resolveTrace(ctx, vars)
	}
	if strings.Contains(query, "query logs") || strings.Contains(query, "query { logs") {
		return r.resolveLogs(ctx, vars)
	}
	if strings.Contains(query, "query metrics") || strings.Contains(query, "query { metrics") {
		return r.resolveMetrics(ctx, vars)
	}
	if strings.Contains(query, "query uql") || strings.Contains(query, "query { uql") {
		return r.resolveUQL(ctx, vars)
	}
	if strings.Contains(query, "pipelines") {
		return r.resolvePipelines(ctx, vars)
	}
	if strings.Contains(query, "pipeline(") {
		return r.resolvePipeline(ctx, vars)
	}
	if strings.Contains(query, "pipelineValidate") {
		return r.resolvePipelineValidate(ctx, vars)
	}
	if strings.Contains(query, "pipelineExportYAML") {
		return r.resolvePipelineExportYAML(ctx, vars)
	}
	if strings.Contains(query, "telemetryStats") {
		return r.resolveTelemetryStats(ctx, vars)
	}
	if strings.Contains(query, "optimizationRecommendations") {
		return r.resolveOptimizationRecommendations(ctx, vars)
	}
	if strings.Contains(query, "chaosExperiments") {
		return r.resolveChaosExperiments(ctx, vars)
	}
	if strings.Contains(query, "chaosExperiment(") {
		return r.resolveChaosExperiment(ctx, vars)
	}
	if strings.Contains(query, "chaosBlastRadius") {
		return r.resolveChaosBlastRadius(ctx, vars)
	}
	if strings.Contains(query, "agents") {
		return r.resolveAgents(ctx, vars)
	}
	if strings.Contains(query, "alertRules") {
		return r.resolveAlertRules(ctx, vars)
	}
	if strings.Contains(query, "alertRule(") {
		return r.resolveAlertRule(ctx, vars)
	}
	if strings.Contains(query, "alertHistory") {
		return r.resolveAlertHistory(ctx, vars)
	}
	if strings.Contains(query, "notificationChannels") {
		return r.resolveNotificationChannels(ctx, vars)
	}
	if strings.Contains(query, "silenceRules") {
		return r.resolveSilenceRules(ctx, vars)
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
			toString(StartTime) as StartTime, Duration, StatusCode, StatusMessage,
			Attributes, ResourceAttributes
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
			"attributes":    parseAttributes(s.Attributes),
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
			toString(StartTime) as StartTime, Duration, StatusCode, StatusMessage,
			Attributes
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
			"attributes":    parseAttributes(attrs),
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


func (r *GraphQLResolver) resolveUQL(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	queryStr, _ := vars["query"].(string)
	if queryStr == "" {
		return nil, fmt.Errorf("uql query is required")
	}

	parser := uql.NewParser(queryStr)
	query, err := parser.Parse()
	if err != nil {
		return nil, fmt.Errorf("uql parse error: %w", err)
	}

	sqlQuery, args, err := query.ToClickhouse()
	if err != nil {
		return nil, fmt.Errorf("uql translation error: %w", err)
	}

	rows, err := r.db.QueryContext(ctx, sqlQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("uql query failed: %w", err)
	}
	defer rows.Close()

	if query.Aggregation != nil {
		return r.uqlAggregationResult(rows, query.Aggregation)
	}
	
	if query.Join != nil {
		return r.uqlJoinResult(rows, query.Join)
	}

	switch query.Type {
	case uql.QueryTypeTraces:
		return r.uqlTraceResult(rows)
	case uql.QueryTypeLogs:
		return r.uqlLogResult(rows)
	default:
		return nil, fmt.Errorf("unknown query type")
	}
}

func (r *GraphQLResolver) uqlAggregationResult(rows *sql.Rows, agg *uql.AggregationNode) (interface{}, error) {
	cols, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %w", err)
	}

	var results []interface{}
	
	for rows.Next() {
		// Create a slice of interface{}'s to represent each column,
		// and a second slice to contain pointers to each item in the columns slice.
		columns := make([]interface{}, len(cols))
		columnPointers := make([]interface{}, len(cols))
		for i := range columns {
			columnPointers[i] = &columns[i]
		}

		if err := rows.Scan(columnPointers...); err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}

		var keys []string
		var values []interface{}
		
		for i, colName := range cols {
			val := columns[i]
			if val == nil {
				continue
			}
			
			// Assuming grouping keys are strings and aggregation values are floats
			switch v := val.(type) {
			case []byte:
				// Typically for strings in driver
				if agg.GroupByField != "" && i == 0 {
					keys = append(keys, string(v))
				} else {
					// Fallback if float is returned as string
					floatVal, _ := strconv.ParseFloat(string(v), 64)
					values = append(values, map[string]interface{}{
						"function": colName,
						"value": floatVal,
					})
				}
			case string:
				if agg.GroupByField != "" && i == 0 {
					keys = append(keys, v)
				} else {
					floatVal, _ := strconv.ParseFloat(v, 64)
					values = append(values, map[string]interface{}{
						"function": colName,
						"value": floatVal,
					})
				}
			default:
				// Float, int, etc.
				floatVal := 0.0
				switch vt := v.(type) {
				case float64:
					floatVal = vt
				case float32:
					floatVal = float64(vt)
				case int64:
					floatVal = float64(vt)
				case int32:
					floatVal = float64(vt)
				case int:
					floatVal = float64(vt)
				case uint64:
					floatVal = float64(vt)
				case uint32:
					floatVal = float64(vt)
				}
				values = append(values, map[string]interface{}{
					"function": colName,
					"value": floatVal,
				})
			}
		}

		results = append(results, map[string]interface{}{
			"keys": keys,
			"values": values,
		})
	}
	
	return map[string]interface{}{"aggregation": results}, nil
}

func (r *GraphQLResolver) uqlJoinResult(rows *sql.Rows, join *uql.JoinNode) (interface{}, error) {
	// For MVP, only traces to logs is supported.
	// Columns: t.TraceId, t.SpanId, t.ParentSpanId, t.OperationName, t.ServiceName, t.StartTime, t.Duration, t.StatusCode, t.StatusMessage, t.Attributes, t.ResourceAttributes
	// LogTimestamp, LogSeverity, LogBody, LogAttributes
	
	traceMap := make(map[string]map[string]interface{})
	
	for rows.Next() {
		var TraceID, SpanID, OperationName, ServiceName, StartTime, LogTimestamp, LogSeverity, LogBody string
		var ParentSpanID, StatusMessage, Attributes, ResourceAttributes, LogAttributes *string
		var Duration int64
		var StatusCode int32
		
		if err := rows.Scan(
			&TraceID, &SpanID, &ParentSpanID, &OperationName, &ServiceName, &StartTime,
			&Duration, &StatusCode, &StatusMessage, &Attributes, &ResourceAttributes,
			&LogTimestamp, &LogSeverity, &LogBody, &LogAttributes,
		); err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}
		
		traceObj, ok := traceMap[TraceID]
		if !ok {
			traceObj = map[string]interface{}{
				"trace": map[string]interface{}{
					"traceId": TraceID,
					"spans":   []interface{}{},
				},
				"logs": []interface{}{},
			}
			traceMap[TraceID] = traceObj
		}
		
		// Add span (naive deduplication for spans)
		spans := traceObj["trace"].(map[string]interface{})["spans"].([]interface{})
		spanExists := false
		for _, s := range spans {
			if s.(map[string]interface{})["spanId"] == SpanID {
				spanExists = true
				break
			}
		}
		if !spanExists {
			span := map[string]interface{}{
				"spanId":        SpanID,
				"parentSpanId":  ParentSpanID,
				"operationName": OperationName,
				"serviceName":   ServiceName,
				"startTime":     StartTime,
				"duration":      Duration,
				"statusCode":    StatusCode,
				"attributes":    parseAttributes(Attributes),
				"events":        []interface{}{},
			}
			traceObj["trace"].(map[string]interface{})["spans"] = append(spans, span)
		}
		
		// Add log
		if LogTimestamp != "" {
			log := map[string]interface{}{
				"timestamp": LogTimestamp,
				"severity": LogSeverity,
				"body": LogBody,
				"traceId": TraceID,
				"attributes": parseAttributes(LogAttributes),
			}
			traceObj["logs"] = append(traceObj["logs"].([]interface{}), log)
		}
	}
	
	var joinResults []interface{}
	for _, v := range traceMap {
		joinResults = append(joinResults, v)
	}
	
	return map[string]interface{}{"joinResults": joinResults}, nil
}

func (r *GraphQLResolver) uqlTraceResult(rows *sql.Rows) (interface{}, error) {
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
			"attributes":    parseAttributes(s.Attributes),
			"events":        []interface{}{},
		}
		traceObj["spans"] = append(traceObj["spans"].([]interface{}), span)
	}

	traces := make([]interface{}, 0, len(traceMap))
	for _, t := range traceMap {
		traces = append(traces, t)
	}

	return map[string]interface{}{"uql": map[string]interface{}{"traces": traces}}, nil
}

func (r *GraphQLResolver) uqlLogResult(rows *sql.Rows) (interface{}, error) {
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
			"attributes": parseAttributes(attrs),
		})
	}

	return map[string]interface{}{"uql": map[string]interface{}{"logs": logs}}, nil
}

func (r *GraphQLResolver) resolveMutation(ctx context.Context, query string, vars map[string]interface{}) (interface{}, error) {
	if strings.Contains(query, "pipelineCreate") {
		return r.resolvePipelineCreate(ctx, vars)
	}
	if strings.Contains(query, "pipelineUpdate") {
		return r.resolvePipelineUpdate(ctx, vars)
	}
	if strings.Contains(query, "pipelineDelete") {
		return r.resolvePipelineDelete(ctx, vars)
	}
	if strings.Contains(query, "pipelineDeploy") {
		return r.resolvePipelineDeploy(ctx, vars)
	}
	if strings.Contains(query, "applyRecommendation") {
		return r.resolveApplyRecommendation(ctx, vars)
	}
	if strings.Contains(query, "chaosCreateExperiment") {
		return r.resolveChaosCreateExperiment(ctx, vars)
	}
	if strings.Contains(query, "chaosStartExperiment") {
		return r.resolveChaosStartExperiment(ctx, vars)
	}
	if strings.Contains(query, "chaosCancelExperiment") {
		return r.resolveChaosCancelExperiment(ctx, vars)
	}
	if strings.Contains(query, "createAlertRule") {
		return r.resolveCreateAlertRule(ctx, vars)
	}
	if strings.Contains(query, "updateAlertRule") {
		return r.resolveUpdateAlertRule(ctx, vars)
	}
	if strings.Contains(query, "deleteAlertRule") {
		return r.resolveDeleteAlertRule(ctx, vars)
	}
	if strings.Contains(query, "createNotificationChannel") {
		return r.resolveCreateNotificationChannel(ctx, vars)
	}
	if strings.Contains(query, "deleteNotificationChannel") {
		return r.resolveDeleteNotificationChannel(ctx, vars)
	}
	if strings.Contains(query, "createSilenceRule") {
		return r.resolveCreateSilenceRule(ctx, vars)
	}
	if strings.Contains(query, "deleteSilenceRule") {
		return r.resolveDeleteSilenceRule(ctx, vars)
	}
	if strings.Contains(query, "testNotification") {
		return r.resolveTestNotification(ctx, vars)
	}
	return nil, fmt.Errorf("unsupported mutation")
}

func (r *GraphQLResolver) resolvePipelines(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	pipelines := r.pipelineStore.List()
	items := make([]interface{}, 0, len(pipelines))
	for _, p := range pipelines {
		items = append(items, pipelineToMap(p))
	}
	return map[string]interface{}{"pipelines": items}, nil
}

func (r *GraphQLResolver) resolvePipeline(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("pipeline id is required")
	}
	p, ok := r.pipelineStore.Get(id)
	if !ok {
		return map[string]interface{}{"pipeline": nil}, nil
	}
	return map[string]interface{}{"pipeline": pipelineToMap(p)}, nil
}

func (r *GraphQLResolver) resolvePipelineCreate(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	inputRaw, ok := vars["input"]
	if !ok {
		return nil, fmt.Errorf("input is required")
	}
	inputMap, ok := inputRaw.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid input format")
	}
	input, err := mapToPipelineInput(inputMap)
	if err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}
	p := r.pipelineStore.Create(*input)
	return map[string]interface{}{"pipelineCreate": pipelineToMap(p)}, nil
}

func (r *GraphQLResolver) resolvePipelineUpdate(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("pipeline id is required")
	}
	inputRaw, ok := vars["input"]
	if !ok {
		return nil, fmt.Errorf("input is required")
	}
	inputMap, ok := inputRaw.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid input format")
	}
	input, err := mapToPipelineInput(inputMap)
	if err != nil {
		return nil, fmt.Errorf("invalid input: %w", err)
	}
	p, ok := r.pipelineStore.Update(id, *input)
	if !ok {
		return nil, fmt.Errorf("pipeline not found: %s", id)
	}
	return map[string]interface{}{"pipelineUpdate": pipelineToMap(p)}, nil
}

func (r *GraphQLResolver) resolvePipelineDelete(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("pipeline id is required")
	}
	ok := r.pipelineStore.Delete(id)
	return map[string]interface{}{"pipelineDelete": ok}, nil
}

func (r *GraphQLResolver) resolvePipelineValidate(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("pipeline id is required")
	}
	p, ok := r.pipelineStore.Get(id)
	if !ok {
		return nil, fmt.Errorf("pipeline not found: %s", id)
	}
	valid, validationErrors := pipeline.Validate(p)
	return map[string]interface{}{
		"pipelineValidate": map[string]interface{}{
			"valid":  valid,
			"errors": validationErrors,
		},
	}, nil
}

func (r *GraphQLResolver) resolvePipelineExportYAML(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("pipeline id is required")
	}
	p, ok := r.pipelineStore.Get(id)
	if !ok {
		return nil, fmt.Errorf("pipeline not found: %s", id)
	}
	yamlStr, err := pipeline.ExportYAML(p)
	if err != nil {
		return nil, fmt.Errorf("yaml export failed: %w", err)
	}
	return map[string]interface{}{"pipelineExportYAML": yamlStr}, nil
}

func (r *GraphQLResolver) resolvePipelineDeploy(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("pipeline id is required")
	}
	p, ok := r.pipelineStore.Get(id)
	if !ok {
		return nil, fmt.Errorf("pipeline not found: %s", id)
	}
	result, err := pipeline.Deploy(ctx, p)
	if err != nil {
		return nil, fmt.Errorf("deploy failed: %w", err)
	}
	return map[string]interface{}{
		"pipelineDeploy": map[string]interface{}{
			"containerId": result.ContainerID,
			"status":      result.Status,
		},
	}, nil
}

func pipelineToMap(p *pipeline.Pipeline) map[string]interface{} {
	nodes := make([]interface{}, 0, len(p.Nodes))
	for _, n := range p.Nodes {
		nodes = append(nodes, map[string]interface{}{
			"id":         n.ID,
			"type":       string(n.Type),
			"label":      n.Label,
			"properties": n.Properties,
			"position": map[string]interface{}{
				"x": n.Position.X,
				"y": n.Position.Y,
			},
		})
	}
	edges := make([]interface{}, 0, len(p.Edges))
	for _, e := range p.Edges {
		edge := map[string]interface{}{
			"id":     e.ID,
			"source": e.Source,
			"target": e.Target,
		}
		if e.SourceHandle != nil {
			edge["sourceHandle"] = *e.SourceHandle
		}
		if e.TargetHandle != nil {
			edge["targetHandle"] = *e.TargetHandle
		}
		edges = append(edges, edge)
	}
	return map[string]interface{}{
		"id":    p.ID,
		"name":  p.Name,
		"nodes": nodes,
		"edges": edges,
	}
}

func mapToPipelineInput(m map[string]interface{}) (*pipeline.PipelineInput, error) {
	name, _ := m["name"].(string)
	if name == "" {
		return nil, fmt.Errorf("pipeline name is required")
	}
	input := &pipeline.PipelineInput{
		Name:  name,
		Nodes: []pipeline.PipelineNode{},
		Edges: []pipeline.PipelineEdge{},
	}
	if nodesRaw, ok := m["nodes"].([]interface{}); ok {
		for _, nr := range nodesRaw {
			nm, ok := nr.(map[string]interface{})
			if !ok {
				continue
			}
			node := pipeline.PipelineNode{
				ID:         getString(nm, "id"),
				Type:       pipeline.NodeType(getString(nm, "type")),
				Label:      getString(nm, "label"),
				Properties: nm,
			}
			if posRaw, ok := nm["position"].(map[string]interface{}); ok {
				node.Position.X = getFloat(posRaw, "x")
				node.Position.Y = getFloat(posRaw, "y")
			}
			if propsRaw, ok := nm["properties"]; ok {
				if propsMap, ok := propsRaw.(map[string]interface{}); ok {
					node.Properties = propsMap
				}
			}
			input.Nodes = append(input.Nodes, node)
		}
	}
	if edgesRaw, ok := m["edges"].([]interface{}); ok {
		for _, er := range edgesRaw {
			em, ok := er.(map[string]interface{})
			if !ok {
				continue
			}
			edge := pipeline.PipelineEdge{
				ID:     getString(em, "id"),
				Source: getString(em, "source"),
				Target: getString(em, "target"),
			}
			if sh, ok := em["sourceHandle"].(string); ok {
				edge.SourceHandle = &sh
			}
			if th, ok := em["targetHandle"].(string); ok {
				edge.TargetHandle = &th
			}
			input.Edges = append(input.Edges, edge)
		}
	}
	return input, nil
}

func getString(m map[string]interface{}, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func getFloat(m map[string]interface{}, key string) float64 {
	if v, ok := m[key].(float64); ok {
		return v
	}
	return 0
}

func parseAttributes(attrs *string) []interface{} {
	if attrs == nil || *attrs == "" {
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

func strPtr(s string) *string {
	return &s
}

func (r *GraphQLResolver) resolveTelemetryStats(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	st, _ := vars["startTime"].(string)
	et, _ := vars["endTime"].(string)

	query := `
		SELECT 
			ServiceName, 
			COUNT(*) as SpanCount, 
			SUM(CASE WHEN StatusCode = 2 THEN 1 ELSE 0 END) as ErrorCount, 
			AVG(Duration) as AvgDuration 
		FROM otel_traces 
		WHERE StartTime >= ? AND StartTime <= ? 
		GROUP BY ServiceName
	`

	rows, err := r.db.QueryContext(ctx, query, st, et)
	if err != nil {
		return nil, fmt.Errorf("telemetry stats query failed: %w", err)
	}
	defer rows.Close()

	var totalSpans int
	var services []optimizer.ServiceSpans

	for rows.Next() {
		var svc optimizer.ServiceSpans
		if err := rows.Scan(&svc.ServiceName, &svc.SpanCount, &svc.ErrorCount, &svc.AverageDuration); err != nil {
			return nil, fmt.Errorf("stats scan failed: %w", err)
		}
		totalSpans += svc.SpanCount
		services = append(services, svc)
	}

	totalErrors := 0
	for _, svc := range services {
		totalErrors += svc.ErrorCount
	}

	errorRate := 0.0
	if totalSpans > 0 {
		errorRate = float64(totalErrors) / float64(totalSpans)
	}

	return map[string]interface{}{
		"telemetryStats": optimizer.TelemetryStats{
			TotalSpans:      totalSpans,
			SpansPerService: services,
			ErrorRate:       errorRate,
			AverageLatency:  0, // Would need global average, skipping for brevity
		},
	}, nil
}

func (r *GraphQLResolver) resolveOptimizationRecommendations(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	st, _ := vars["startTime"].(string)
	et, _ := vars["endTime"].(string)

	statsResult, err := r.resolveTelemetryStats(ctx, vars)
	if err != nil {
		return nil, err
	}
	
	statsMap := statsResult.(map[string]interface{})
	stats := statsMap["telemetryStats"].(optimizer.TelemetryStats)

	recs, err := optimizer.AnalyzeTraces(ctx, r.db, stats, st, et)
	if err != nil {
		return nil, fmt.Errorf("optimization analysis failed: %w", err)
	}

	return map[string]interface{}{"optimizationRecommendations": recs}, nil
}

func (r *GraphQLResolver) resolveApplyRecommendation(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	pipelineID, _ := vars["pipelineId"].(string)
	recID, _ := vars["recommendationId"].(string)

	if pipelineID == "" || recID == "" {
		return nil, fmt.Errorf("pipelineId and recommendationId are required")
	}

	p, ok := r.pipelineStore.Get(pipelineID)
	if !ok {
		return nil, fmt.Errorf("pipeline not found")
	}

	// For MVP, we need the recommendation object. Since we don't persist recommendations in a DB, 
	// we will just re-run the analyzer to find it by ID. 
	// (In a real app, recommendations would be stored or the frontend would pass the config directly).
	
	// We'll use a wide time range to ensure we can recreate it.
	st := time.Now().Add(-24 * time.Hour).Format(time.RFC3339)
	et := time.Now().Format(time.RFC3339)
	
	// Query stats manually
	statsResult, err := r.resolveTelemetryStats(ctx, map[string]interface{}{"startTime": st, "endTime": et})
	var recs []optimizer.OptimizationRecommendation
	if err == nil {
		statsMap := statsResult.(map[string]interface{})
		stats := statsMap["telemetryStats"].(optimizer.TelemetryStats)
		recs, _ = optimizer.AnalyzeTraces(ctx, r.db, stats, st, et)
	}

	var targetRec *optimizer.OptimizationRecommendation
	for _, r := range recs {
		if r.ID == recID {
			targetRec = &r
			break
		}
	}

	if targetRec == nil {
		return nil, fmt.Errorf("recommendation not found or no longer applies")
	}

	if err := optimizer.ApplyRecommendation(p, *targetRec); err != nil {
		return nil, fmt.Errorf("failed to apply recommendation: %w", err)
	}

	input := pipeline.PipelineInput{
		Name:  p.Name,
		Nodes: p.Nodes,
		Edges: p.Edges,
	}
	p, _ = r.pipelineStore.Update(pipelineID, input)

	return map[string]interface{}{"applyRecommendation": pipelineToMap(p)}, nil
}

func (r *GraphQLResolver) resolveAgents(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	resp, err := http.Get("http://localhost:8082/v1/agents")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch agents from control plane: %w", err)
	}
	defer resp.Body.Close()

	var agents []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&agents); err != nil {
		return nil, fmt.Errorf("failed to decode agents: %w", err)
	}

	return map[string]interface{}{"agents": agents}, nil
}
