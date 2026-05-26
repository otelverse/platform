package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	collectorLogs "go.opentelemetry.io/proto/otlp/collector/logs/v1"
	collectorTrace "go.opentelemetry.io/proto/otlp/collector/trace/v1"
	common "go.opentelemetry.io/proto/otlp/common/v1"
	logs "go.opentelemetry.io/proto/otlp/logs/v1"
	trace "go.opentelemetry.io/proto/otlp/trace/v1"
)

type TraceReceiver struct {
	collectorTrace.UnimplementedTraceServiceServer
	db *sql.DB
}

type LogsReceiver struct {
	collectorLogs.UnimplementedLogsServiceServer
	db *sql.DB
}

func NewTraceReceiver(db *sql.DB) *TraceReceiver {
	return &TraceReceiver{db: db}
}

func NewLogsReceiver(db *sql.DB) *LogsReceiver {
	return &LogsReceiver{db: db}
}

func (r *TraceReceiver) Export(ctx context.Context, req *collectorTrace.ExportTraceServiceRequest) (*collectorTrace.ExportTraceServiceResponse, error) {
	for _, rspans := range req.ResourceSpans {
		resourceAttrs := attrsToMap(rspans.Resource.GetAttributes())

		for _, s := range rspans.ScopeSpans {
			for _, span := range s.Spans {
				if err := r.insertSpan(ctx, span, resourceAttrs); err != nil {
					log.Printf("failed to insert span: %v", err)
					continue
				}
			}
		}
	}
	return &collectorTrace.ExportTraceServiceResponse{}, nil
}

func (r *LogsReceiver) Export(ctx context.Context, req *collectorLogs.ExportLogsServiceRequest) (*collectorLogs.ExportLogsServiceResponse, error) {
	for _, rlogs := range req.ResourceLogs {
		resourceAttrs := attrsToMap(rlogs.Resource.GetAttributes())

		for _, s := range rlogs.ScopeLogs {
			for _, logRecord := range s.LogRecords {
				if err := r.insertLog(ctx, logRecord, resourceAttrs); err != nil {
					log.Printf("failed to insert log: %v", err)
					continue
				}
			}
		}
	}
	return &collectorLogs.ExportLogsServiceResponse{}, nil
}

func (r *TraceReceiver) insertSpan(ctx context.Context, span *trace.Span, resourceAttrs map[string]string) error {
	startTime := span.GetStartTimeUnixNano()
	duration := span.GetEndTimeUnixNano() - startTime

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO otel_traces (
			TraceId, SpanId, ParentSpanId, OperationName, ServiceName,
			StartTime, Duration, StatusCode, StatusMessage,
			Attributes, ResourceAttributes
		) VALUES (
			?, ?, ?, ?, ?,
			?, ?, ?, ?,
			?, ?
		)
	`,
		formatID(span.TraceId),
		formatID(span.SpanId),
		formatID(span.ParentSpanId),
		span.GetName(),
		resourceAttrs["service.name"],
		time.Unix(0, int64(startTime)),
		int64(duration),
		int32(span.GetStatus().GetCode()),
		span.GetStatus().GetMessage(),
		attrsToMap(span.GetAttributes()),
		resourceAttrs,
	)
	return err
}

func (r *LogsReceiver) insertLog(ctx context.Context, logRecord *logs.LogRecord, resourceAttrs map[string]string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO otel_logs (
			Timestamp, TraceId, SpanId, SeverityText, SeverityNumber,
			Body, ServiceName, Attributes, ResourceAttributes
		) VALUES (
			?, ?, ?, ?, ?,
			?, ?, ?, ?
		)
	`,
		time.Unix(0, int64(logRecord.GetTimeUnixNano())),
		formatID(logRecord.TraceId),
		formatID(logRecord.SpanId),
		logRecord.GetSeverityText(),
		int32(logRecord.GetSeverityNumber()),
		logRecord.GetBody().GetStringValue(),
		resourceAttrs["service.name"],
		attrsToMap(logRecord.GetAttributes()),
		resourceAttrs,
	)
	return err
}

func attrsToMap(attrs []*common.KeyValue) map[string]string {
	if len(attrs) == 0 {
		return nil
	}
	m := make(map[string]string, len(attrs))
	for _, kv := range attrs {
		m[kv.Key] = valueToString(kv.Value)
	}
	return m
}

func valueToString(v *common.AnyValue) string {
	if v == nil {
		return ""
	}
	switch val := v.Value.(type) {
	case *common.AnyValue_StringValue:
		return val.StringValue
	case *common.AnyValue_IntValue:
		return fmt.Sprintf("%d", val.IntValue)
	case *common.AnyValue_DoubleValue:
		return fmt.Sprintf("%f", val.DoubleValue)
	case *common.AnyValue_BoolValue:
		return fmt.Sprintf("%t", val.BoolValue)
	default:
		return fmt.Sprintf("%v", v.Value)
	}
}

func formatID(id []byte) string {
	if len(id) == 0 {
		return ""
	}
	return fmt.Sprintf("%x", id)
}

func StartOTLPReceiver(db *sql.DB, addr string) (*grpc.Server, error) {
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		return nil, fmt.Errorf("failed to listen on %s: %w", addr, err)
	}

	srv := grpc.NewServer(grpc.Creds(insecure.NewCredentials()))

	collectorTrace.RegisterTraceServiceServer(srv, NewTraceReceiver(db))
	collectorLogs.RegisterLogsServiceServer(srv, NewLogsReceiver(db))

	go func() {
		log.Printf("Starting OTLP gRPC receiver on %s", addr)
		if err := srv.Serve(lis); err != nil {
			log.Fatalf("OTLP receiver failed: %v", err)
		}
	}()

	return srv, nil
}
