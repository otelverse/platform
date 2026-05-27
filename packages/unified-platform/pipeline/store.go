package pipeline

import (
	"fmt"
	"sync"
)

type NodeType string

const (
	NodeTypeReceiverOTLP           NodeType = "RECEIVER_OTLP"
	NodeTypeProcessorBatch         NodeType = "PROCESSOR_BATCH"
	NodeTypeProcessorMemoryLimiter NodeType = "PROCESSOR_MEMORY_LIMITER"
	NodeTypeProcessorTailSampling  NodeType = "PROCESSOR_TAIL_SAMPLING"
	NodeTypeExporterLogging        NodeType = "EXPORTER_LOGGING"
	NodeTypeExporterOTLP           NodeType = "EXPORTER_OTLP"
)

type Position struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type PipelineNode struct {
	ID         string                 `json:"id"`
	Type       NodeType               `json:"type"`
	Label      string                 `json:"label"`
	Properties map[string]interface{} `json:"properties"`
	Position   Position               `json:"position"`
}

type PipelineEdge struct {
	ID           string  `json:"id"`
	Source       string  `json:"source"`
	Target       string  `json:"target"`
	SourceHandle *string `json:"sourceHandle"`
	TargetHandle *string `json:"targetHandle"`
}

type Pipeline struct {
	ID    string         `json:"id"`
	Name  string         `json:"name"`
	Nodes []PipelineNode `json:"nodes"`
	Edges []PipelineEdge `json:"edges"`
}

type Store struct {
	mu        sync.RWMutex
	pipelines map[string]*Pipeline
	nextID    int
}

func NewStore() *Store {
	s := &Store{
		pipelines: make(map[string]*Pipeline),
		nextID:    1,
	}
	s.seed()
	return s
}

func (s *Store) seed() {
	s.pipelines["default"] = &Pipeline{
		ID:   "default",
		Name: "Default Pipeline",
		Nodes: []PipelineNode{
			{ID: "node-1", Type: NodeTypeReceiverOTLP, Label: "OTLP Receiver", Properties: map[string]interface{}{"endpoint": "0.0.0.0:4317"}, Position: Position{X: 100, Y: 100}},
			{ID: "node-2", Type: NodeTypeProcessorBatch, Label: "Batch Processor", Properties: map[string]interface{}{}, Position: Position{X: 400, Y: 100}},
			{ID: "node-3", Type: NodeTypeExporterLogging, Label: "Logging Exporter", Properties: map[string]interface{}{"verbosity": "detailed"}, Position: Position{X: 700, Y: 100}},
		},
		Edges: []PipelineEdge{
			{ID: "edge-1", Source: "node-1", Target: "node-2"},
			{ID: "edge-2", Source: "node-2", Target: "node-3"},
		},
	}
}

func (s *Store) List() []*Pipeline {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*Pipeline, 0, len(s.pipelines))
	for _, p := range s.pipelines {
		result = append(result, p)
	}
	return result
}

func (s *Store) Get(id string) (*Pipeline, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	p, ok := s.pipelines[id]
	return p, ok
}

type PipelineInput struct {
	Name  string         `json:"name"`
	Nodes []PipelineNode `json:"nodes"`
	Edges []PipelineEdge `json:"edges"`
}

func (s *Store) Create(input PipelineInput) *Pipeline {
	s.mu.Lock()
	defer s.mu.Unlock()
	id := fmt.Sprintf("pipeline-%d", s.nextID)
	s.nextID++
	p := &Pipeline{
		ID:    id,
		Name:  input.Name,
		Nodes: input.Nodes,
		Edges: input.Edges,
	}
	s.pipelines[id] = p
	return p
}

func (s *Store) Update(id string, input PipelineInput) (*Pipeline, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	_, ok := s.pipelines[id]
	if !ok {
		return nil, false
	}
	p := &Pipeline{
		ID:    id,
		Name:  input.Name,
		Nodes: input.Nodes,
		Edges: input.Edges,
	}
	s.pipelines[id] = p
	return p, true
}

func (s *Store) Delete(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	_, ok := s.pipelines[id]
	if !ok {
		return false
	}
	delete(s.pipelines, id)
	return true
}
