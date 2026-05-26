package pipeline

import (
	"testing"
)

func TestStoreCreateAndList(t *testing.T) {
	s := NewStore()
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
	s := NewStore()
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
	s := NewStore()
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
	s := NewStore()
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
	s := NewStore()
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

func TestValidateValidPipeline(t *testing.T) {
	p := &Pipeline{
		ID:   "test",
		Name: "Valid",
		Nodes: []PipelineNode{
			{ID: "n1", Type: NodeTypeReceiverOTLP, Label: "OTLP"},
			{ID: "n2", Type: NodeTypeExporterLogging, Label: "Logging"},
		},
	}
	valid, errors := Validate(p)
	if !valid {
		t.Fatalf("expected valid, got errors: %v", errors)
	}
}
