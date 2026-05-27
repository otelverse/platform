package proxy

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	coltracepb "go.opentelemetry.io/proto/otlp/collector/trace/v1"
	commonpb "go.opentelemetry.io/proto/otlp/common/v1"
	tracepb "go.opentelemetry.io/proto/otlp/trace/v1"
)

type FaultType string

const (
	FaultTypeLatency FaultType = "LATENCY"
	FaultTypeError   FaultType = "ERROR"
)

type ExperimentConfig struct {
	LatencyMs       int64 `json:"latencyMs,omitempty"`
	ErrorStatusCode int32 `json:"errorStatusCode,omitempty"`
}

type Experiment struct {
	ID             string           `json:"id"`
	TargetService  string           `json:"targetService"`
	TargetSpanName string           `json:"targetSpanName,omitempty"`
	FaultType      FaultType        `json:"faultType"`
	Config         ExperimentConfig `json:"config"`
	Status         string           `json:"status"`
}

type ChaosProxy struct {
	coltracepb.UnimplementedTraceServiceServer
	targetClient coltracepb.TraceServiceClient
	experiments  []Experiment
	configPath   string
	platformURL  string
}

func NewChaosProxy(targetURL string, configPath string, platformURL string) (*ChaosProxy, error) {
	conn, err := grpc.Dial(targetURL, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	client := coltracepb.NewTraceServiceClient(conn)

	p := &ChaosProxy{
		targetClient: client,
		configPath:   configPath,
		platformURL:  platformURL,
	}

	p.reloadConfig()
	go func() {
		for {
			time.Sleep(10 * time.Second)
			p.reloadConfig()
		}
	}()

	return p, nil
}

func (p *ChaosProxy) reloadConfig() {
	if p.platformURL != "" {
		// Fetch from platform GraphQL (MVP: simplistic fetch)
		p.fetchFromPlatform()
	} else if p.configPath != "" {
		data, err := ioutil.ReadFile(p.configPath)
		if err == nil {
			var exps []Experiment
			if err := json.Unmarshal(data, &exps); err == nil {
				p.experiments = exps
				log.Printf("Loaded %d experiments from file", len(exps))
			}
		}
	}
}

type gqlResponse struct {
	Data struct {
		ChaosExperiments []Experiment `json:"chaosExperiments"`
	} `json:"data"`
}

func (p *ChaosProxy) fetchFromPlatform() {
	query := `{"query":"query { chaosExperiments { id targetService targetSpanName faultType config status } }"}`
	resp, err := http.Post(p.platformURL, "application/json", strings.NewReader(query))
	if err != nil {
		log.Printf("Failed to fetch experiments from platform: %v", err)
		return
	}
	defer resp.Body.Close()

	var res gqlResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		log.Printf("Failed to decode experiments: %v", err)
		return
	}

	var active []Experiment
	for _, e := range res.Data.ChaosExperiments {
		if e.Status == "RUNNING" {
			active = append(active, e)
		}
	}
	p.experiments = active
	log.Printf("Loaded %d active experiments from platform", len(active))
}

func (p *ChaosProxy) Export(ctx context.Context, req *coltracepb.ExportTraceServiceRequest) (*coltracepb.ExportTraceServiceResponse, error) {
	// Mutate spans based on active experiments
	for _, rs := range req.ResourceSpans {
		var serviceName string
		for _, attr := range rs.Resource.Attributes {
			if attr.Key == "service.name" {
				serviceName = attr.Value.GetStringValue()
			}
		}

		for _, scopeSpans := range rs.ScopeSpans {
			for _, span := range scopeSpans.Spans {
				p.applyChaos(serviceName, span)
			}
		}
	}

	// Forward to real collector
	return p.targetClient.Export(ctx, req)
}

func (p *ChaosProxy) applyChaos(serviceName string, span *tracepb.Span) {
	for _, exp := range p.experiments {
		if exp.Status != "RUNNING" && exp.Status != "" {
			continue
		}

		if exp.TargetService != serviceName {
			continue
		}

		if exp.TargetSpanName != "" && exp.TargetSpanName != span.Name {
			continue
		}

		// Apply fault
		if exp.FaultType == FaultTypeLatency {
			delay := uint64(exp.Config.LatencyMs * 1_000_000) // ms to ns
			span.EndTimeUnixNano += delay

			span.Attributes = append(span.Attributes, &commonpb.KeyValue{
				Key: "chaos.injected_latency_ms",
				Value: &commonpb.AnyValue{
					Value: &commonpb.AnyValue_IntValue{IntValue: exp.Config.LatencyMs},
				},
			})
		} else if exp.FaultType == FaultTypeError {
			if span.Status == nil {
				span.Status = &tracepb.Status{}
			}
			span.Status.Code = tracepb.Status_STATUS_CODE_ERROR
			if exp.Config.ErrorStatusCode != 0 {
				span.Attributes = append(span.Attributes, &commonpb.KeyValue{
					Key: "http.status_code", // override or add
					Value: &commonpb.AnyValue{
						Value: &commonpb.AnyValue_IntValue{IntValue: int64(exp.Config.ErrorStatusCode)},
					},
				})
			}

			span.Events = append(span.Events, &tracepb.Span_Event{
				TimeUnixNano: span.EndTimeUnixNano,
				Name:         "chaos.error_injected",
			})
		}

		span.Attributes = append(span.Attributes, &commonpb.KeyValue{
			Key: "chaos.experiment_id",
			Value: &commonpb.AnyValue{
				Value: &commonpb.AnyValue_StringValue{StringValue: exp.ID},
			},
		})
	}
}
