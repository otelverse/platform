package pipeline

import (
	"testing"
)

func TestStoreCreateAndList(t *testing.T) {
	s := NewStore(nil)
	pipelines := s.List()
	if len(pipelines) != 1 {
		t.Fatalf("expected 1 seeded pipeline, got %d", len(pipelines))
	}
	if pipelines[0].ID != "default" {
		t.Fatalf("expected default pipeline ID, got %s", pipelines[0].ID)
	}

	input := PipelineInput{
		Name:  "Test Pipeline",
		Nodes: []PipelineNode{},
		Edges: []PipelineEdge{},
	}
	p := s.Create(input)
	if p.ID == "" {
		t.Fatal("expected non-empty ID")
	}
	if p.Name != "Test Pipeline" {
		t.Fatalf("expected name 'Test Pipeline', got '%s'", p.Name)
	}

	pipelines = s.List()
	if len(pipelines) != 2 {
		t.Fatalf("expected 2 pipelines, got %d", len(pipelines))
	}
}

func TestStoreGet(t *testing.T) {
	s := NewStore(nil)
	p, ok := s.Get("default")
	if !ok {
		t.Fatal("expected to find default pipeline")
	}
	if p.Name != "Default Pipeline" {
		t.Fatalf("expected 'Default Pipeline', got '%s'", p.Name)
	}

	_, ok = s.Get("nonexistent")
	if ok {
		t.Fatal("expected not to find nonexistent pipeline")
	}
}

func TestStoreUpdate(t *testing.T) {
	s := NewStore(nil)
	input := PipelineInput{Name: "Updated Pipeline"}
	p, ok := s.Update("default", input)
	if !ok {
		t.Fatal("expected update to succeed")
	}
	if p.Name != "Updated Pipeline" {
		t.Fatalf("expected 'Updated Pipeline', got '%s'", p.Name)
	}

	_, ok = s.Update("nonexistent", input)
	if ok {
		t.Fatal("expected update of nonexistent to fail")
	}
}

func TestStoreDelete(t *testing.T) {
	s := NewStore(nil)
	input := PipelineInput{Name: "Temp"}
	p := s.Create(input)

	ok := s.Delete(p.ID)
	if !ok {
		t.Fatal("expected delete to succeed")
	}

	_, ok = s.Get(p.ID)
	if ok {
		t.Fatal("expected pipeline to be deleted")
	}

	ok = s.Delete("nonexistent")
	if ok {
		t.Fatal("expected delete of nonexistent to fail")
	}
}

func TestStoreCreateWithNodes(t *testing.T) {
	s := NewStore(nil)
	input := PipelineInput{
		Name: "Full Pipeline",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP", Properties: map[string]interface{}{"endpoint": ":4317"}, Position: Position{X: 100, Y: 200}},
			{ID: "n2", Type: NodeTypeExporterLogging, Label: "Logging", Properties: map[string]interface{}{"verbosity": "detailed"}, Position: Position{X: 300, Y: 200}},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n1", Target: "n2"},
		},
	}
	p := s.Create(input)
	if len(p.Nodes) != 2 {
		t.Fatalf("expected 2 nodes, got %d", len(p.Nodes))
	}
	if len(p.Edges) != 1 {
		t.Fatalf("expected 1 edge, got %d", len(p.Edges))
	}
	if p.Nodes[0].Type != NodeTypeReceiverOTLP {
		t.Fatalf("expected RECEIVER_OTLP, got %s", p.Nodes[0].Type)
	}
}

func TestValidateEmptyPipeline(t *testing.T) {
	p := &Pipeline{ID: "test", Name: "Empty", Nodes: []PipelineNode{}, Edges: []PipelineEdge{}}
	valid, errors := Validate(p)
	if valid {
		t.Fatal("expected empty pipeline to be invalid")
	}
	if len(errors) == 0 {
		t.Fatal("expected error messages")
	}
}

func TestValidateNoReceiver(t *testing.T) {
	p := &Pipeline{
		ID:   "test",
		Name: "No Receiver",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeProcessorBatch, Label: "Batch"},
			{ID: "n2", Type: NodeTypeExporterLogging, Label: "Logging"},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n1", Target: "n2"},
		},
	}
	valid, errors := Validate(p)
	if valid {
		t.Fatal("expected pipeline without receiver to be invalid")
	}
	hasError := false
	for _, e := range errors {
		if e == "pipeline must have at least one receiver node" {
			hasError = true
			break
		}
	}
	if !hasError {
		t.Fatal("expected 'missing receiver' error")
	}
}

func TestValidateNoExporter(t *testing.T) {
	p := &Pipeline{
		ID:   "test",
		Name: "No Exporter",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP"},
			{ID: "n2", Type: NodeTypeProcessorBatch, Label: "Batch"},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n1", Target: "n2"},
		},
	}
	valid, errors := Validate(p)
	if valid {
		t.Fatal("expected pipeline without exporter to be invalid")
	}
	hasError := false
	for _, e := range errors {
		if e == "pipeline must have at least one exporter node" {
			hasError = true
			break
		}
	}
	if !hasError {
		t.Fatal("expected 'missing exporter' error")
	}
}

func TestValidateOrphanNode(t *testing.T) {
	p := &Pipeline{
		ID:   "test",
		Name: "Orphan",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP", Properties: map[string]interface{}{"endpoint": ":4317"}},
			{ID: "n2", Type: NodeTypeExporterLogging, Label: "Logging"},
			{ID: "n3", Type: NodeTypeProcessorBatch, Label: "Orphan Batch"},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n1", Target: "n2"},
		},
	}
	valid, errors := Validate(p)
	if valid {
		t.Fatal("expected pipeline with orphan to be invalid")
	}
	hasError := false
	for _, e := range errors {
		if e == "orphan node not connected by any edge: n3" {
			hasError = true
			break
		}
	}
	if !hasError {
		t.Fatal("expected 'orphan node' error")
	}
}

func TestValidateReceiverEndpointProperty(t *testing.T) {
	p := &Pipeline{
		ID:   "test",
		Name: "Missing Endpoint",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP", Properties: nil},
			{ID: "n2", Type: NodeTypeExporterLogging, Label: "Logging"},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n1", Target: "n2"},
		},
	}
	valid, _ := Validate(p)
	if valid {
		t.Fatal("expected pipeline with missing endpoint to be invalid")
	}
}

func TestValidateInvalidEdgeSource(t *testing.T) {
	p := &Pipeline{
		ID:   "test",
		Name: "Bad Edge",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP", Properties: map[string]interface{}{"endpoint": ":4317"}},
			{ID: "n2", Type: NodeTypeExporterLogging, Label: "Logging"},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "nonexistent", Target: "n2"},
		},
	}
	valid, _ := Validate(p)
	if valid {
		t.Fatal("expected pipeline with invalid edge source to be invalid")
	}
}

func TestValidateReceiverNoIncoming(t *testing.T) {
	p := &Pipeline{
		ID:   "test",
		Name: "Receiver Incoming",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP", Properties: map[string]interface{}{"endpoint": ":4317"}},
			{ID: "n2", Type: NodeTypeProcessorBatch, Label: "Batch"},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n2", Target: "n1"},
		},
	}
	valid, errors := Validate(p)
	if valid {
		t.Fatal("expected pipeline with receiver as target to be invalid")
	}
	hasReceiverTargetError := false
	hasReceiverIncomingError := false
	for _, e := range errors {
		if e == "receiver cannot be a target of an edge: n1" {
			hasReceiverTargetError = true
		}
		if e == "receiver node should not have incoming edges: n1" {
			hasReceiverIncomingError = true
		}
	}
	if !hasReceiverTargetError && !hasReceiverIncomingError {
		t.Fatal("expected receiver target/incoming edge error")
	}
}

func TestValidateFullPipelineWithProcessors(t *testing.T) {
	p := &Pipeline{
		ID:   "test",
		Name: "Full",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP", Properties: map[string]interface{}{"endpoint": ":4317"}},
			{ID: "n2", Type: NodeTypeProcessorBatch, Label: "Batch"},
			{ID: "n3", Type: NodeTypeProcessorMemoryLimiter, Label: "Mem Limit"},
			{ID: "n4", Type: NodeTypeExporterLogging, Label: "Logging"},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n1", Target: "n2"},
			{ID: "e2", Source: "n2", Target: "n3"},
			{ID: "e3", Source: "n3", Target: "n4"},
		},
	}
	valid, errors := Validate(p)
	if !valid {
		t.Fatalf("expected valid full pipeline, got errors: %v", errors)
	}
}

func TestValidateValidPipeline(t *testing.T) {
	p := &Pipeline{
		ID:   "test",
		Name: "Valid",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP", Properties: map[string]interface{}{"endpoint": ":4317"}},
			{ID: "n2", Type: NodeTypeExporterLogging, Label: "Logging"},
		},
		Edges: []PipelineEdge{
			{ID: "e1", Source: "n1", Target: "n2"},
		},
	}
	valid, errors := Validate(p)
	if !valid {
		t.Fatalf("expected valid, got errors: %v", errors)
	}
}
