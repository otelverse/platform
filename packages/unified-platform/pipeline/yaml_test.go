package pipeline

import (
	"strings"
	"testing"
)

func TestExportYAML_BasicPipeline(t *testing.T) {
	p := &Pipeline{
		ID:   "test",
		Name: "Test Pipeline",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP Recv", Properties: map[string]interface{}{"endpoint": "0.0.0.0:4317"}, Position: Position{X: 100, Y: 100}},
			{ID: "n2", Type: NodeTypeProcessorBatch, Label: "Batch", Properties: map[string]interface{}{}, Position: Position{X: 300, Y: 100}},
			{ID: "n3", Type: NodeTypeExporterLogging, Label: "Logging", Properties: map[string]interface{}{"verbosity": "detailed"}, Position: Position{X: 500, Y: 100}},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n1", Target: "n2"},
			{ID: "e2", Source: "n2", Target: "n3"},
		},
	}

	yamlStr, err := ExportYAML(p)
	if err != nil {
		t.Fatalf("ExportYAML failed: %v", err)
	}

	if !strings.Contains(yamlStr, "receivers:") {
		t.Error("expected receivers section")
	}
	if !strings.Contains(yamlStr, "processors:") {
		t.Error("expected processors section")
	}
	if !strings.Contains(yamlStr, "exporters:") {
		t.Error("expected exporters section")
	}
	if !strings.Contains(yamlStr, "service:") {
		t.Error("expected service section")
	}
	if !strings.Contains(yamlStr, "endpoint: 0.0.0.0:4317") {
		t.Error("expected endpoint config")
	}
	if !strings.Contains(yamlStr, "verbosity: detailed") {
		t.Error("expected verbosity config")
	}
}

func TestExportYAML_DirectReceiverToExporter(t *testing.T) {
	p := &Pipeline{
		ID:   "test2",
		Name: "Direct",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP", Properties: map[string]interface{}{"endpoint": ":4317"}},
			{ID: "n2", Type: NodeTypeExporterLogging, Label: "Logging", Properties: map[string]interface{}{}},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n1", Target: "n2"},
		},
	}

	yamlStr, err := ExportYAML(p)
	if err != nil {
		t.Fatalf("ExportYAML failed: %v", err)
	}

	if !strings.Contains(yamlStr, "otlp") {
		t.Error("expected otlp receiver")
	}
	if !strings.Contains(yamlStr, "logging") {
		t.Error("expected logging exporter")
	}
}

func TestExportYAML_EmptyPipeline(t *testing.T) {
	p := &Pipeline{
		ID:    "empty",
		Name:  "Empty",
		Nodes: []PipelineNode{},
		Edges: []PipelineEdge{},
	}

	_, err := ExportYAML(p)
	if err == nil {
		t.Error("expected error for empty pipeline")
	}
}

func TestExportYAML_ProcessorTypes(t *testing.T) {
	p := &Pipeline{
		ID:   "proc-test",
		Name: "Processor Test",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP", Properties: map[string]interface{}{"endpoint": ":4317"}},
			{ID: "n2", Type: NodeTypeProcessorMemoryLimiter, Label: "Mem Limit", Properties: map[string]interface{}{"limit_mib": "1Gi", "spike_limit_mib": "256Mi"}},
			{ID: "n3", Type: NodeTypeProcessorTailSampling, Label: "Sampling", Properties: map[string]interface{}{}},
			{ID: "n4", Type: NodeTypeExporterOTLP, Label: "OTLP Export", Properties: map[string]interface{}{"endpoint": "collector:4317"}},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n1", Target: "n2"},
			{ID: "e2", Source: "n2", Target: "n3"},
			{ID: "e3", Source: "n3", Target: "n4"},
		},
	}

	yamlStr, err := ExportYAML(p)
	if err != nil {
		t.Fatalf("ExportYAML failed: %v", err)
	}

	if !strings.Contains(yamlStr, "memory_limiter") {
		t.Error("expected memory_limiter processor")
	}
	if !strings.Contains(yamlStr, "tail_sampling") {
		t.Error("expected tail_sampling processor")
	}
	if !strings.Contains(yamlStr, "limit_mib: 1Gi") {
		t.Error("expected custom limit_mib")
	}
}

func TestExportYAML_VerifyOutput(t *testing.T) {
	p := &Pipeline{
		ID:   "verify",
		Name: "Verify",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP", Properties: map[string]interface{}{"endpoint": ":4317"}},
			{ID: "n2", Type: NodeTypeExporterLogging, Label: "Logging", Properties: map[string]interface{}{}},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n1", Target: "n2"},
		},
	}

	yamlStr, err := ExportYAML(p)
	if err != nil {
		t.Fatalf("ExportYAML failed: %v", err)
	}

	if err := verifyYAMLOutput(yamlStr); err != nil {
		t.Fatalf("verifyYAMLOutput failed: %v", err)
	}
}
