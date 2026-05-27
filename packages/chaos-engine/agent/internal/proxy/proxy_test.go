package proxy

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	coltracepb "go.opentelemetry.io/proto/otlp/collector/trace/v1"
	commonpb "go.opentelemetry.io/proto/otlp/common/v1"
	resourcepb "go.opentelemetry.io/proto/otlp/resource/v1"
	tracepb "go.opentelemetry.io/proto/otlp/trace/v1"
	"google.golang.org/grpc"
)

type mockTraceClient struct {
	req *coltracepb.ExportTraceServiceRequest
}

func (m *mockTraceClient) Export(ctx context.Context, in *coltracepb.ExportTraceServiceRequest, opts ...grpc.CallOption) (*coltracepb.ExportTraceServiceResponse, error) {
	m.req = in
	return &coltracepb.ExportTraceServiceResponse{}, nil
}

func TestApplyChaos_Latency(t *testing.T) {
	mockClient := &mockTraceClient{}
	p := &ChaosProxy{
		targetClient: mockClient,
		experiments: []Experiment{
			{
				ID:            "exp-1",
				TargetService: "test-service",
				FaultType:     FaultTypeLatency,
				Config: ExperimentConfig{
					LatencyMs: 100,
				},
				Status: "RUNNING",
			},
		},
	}

	span := &tracepb.Span{
		Name:            "test-span",
		EndTimeUnixNano: 1000000000,
	}

	req := &coltracepb.ExportTraceServiceRequest{
		ResourceSpans: []*tracepb.ResourceSpans{
			{
				Resource: &resourcepb.Resource{
					Attributes: []*commonpb.KeyValue{
						{
							Key:   "service.name",
							Value: &commonpb.AnyValue{Value: &commonpb.AnyValue_StringValue{StringValue: "test-service"}},
						},
					},
				},
				ScopeSpans: []*tracepb.ScopeSpans{
					{
						Spans: []*tracepb.Span{span},
					},
				},
			},
		},
	}

	_, err := p.Export(context.Background(), req)
	assert.NoError(t, err)
	assert.NotNil(t, mockClient.req)

	mutatedSpan := mockClient.req.ResourceSpans[0].ScopeSpans[0].Spans[0]
	
	// Expect end time to increase by 100ms = 100,000,000ns
	assert.Equal(t, uint64(1000000000+100000000), mutatedSpan.EndTimeUnixNano)

	// Expect chaos attribute
	found := false
	for _, attr := range mutatedSpan.Attributes {
		if attr.Key == "chaos.experiment_id" {
			assert.Equal(t, "exp-1", attr.Value.GetStringValue())
			found = true
		}
	}
	assert.True(t, found)
}
