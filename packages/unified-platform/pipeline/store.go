package pipeline

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
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
	db        *sql.DB
	mu        sync.RWMutex
	pipelines map[string]*Pipeline
	nextID    int
}

func NewStore(db *sql.DB) *Store {
	s := &Store{
		db:        db,
		pipelines: make(map[string]*Pipeline),
		nextID:    1,
	}
	if db == nil {
		s.seed()
	} else {
		// Insert default if table is empty
		var count int
		if err := db.QueryRow(`SELECT count(*) FROM pipelines`).Scan(&count); err == nil && count == 0 {
			def := &Pipeline{
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
			defJSON, _ := json.Marshal(def)
			db.Exec(`INSERT INTO pipelines (id, name, definition) VALUES ($1, $2, $3)`, def.ID, def.Name, defJSON)
		}
	}
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
	if s.db != nil {
		rows, err := s.db.Query(`SELECT id, name, definition FROM pipelines`)
		if err != nil {
			log.Printf("List pipelines db error: %v", err)
			return nil
		}
		defer rows.Close()
		var res []*Pipeline
		for rows.Next() {
			var id, name string
			var defJSON []byte
			if err := rows.Scan(&id, &name, &defJSON); err == nil {
				var p Pipeline
				if err := json.Unmarshal(defJSON, &p); err == nil {
					p.ID = id
					p.Name = name
					res = append(res, &p)
				}
			}
		}
		return res
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*Pipeline, 0, len(s.pipelines))
	for _, p := range s.pipelines {
		result = append(result, p)
	}
	return result
}

func (s *Store) Get(id string) (*Pipeline, bool) {
	if s.db != nil {
		var name string
		var defJSON []byte
		if err := s.db.QueryRow(`SELECT name, definition FROM pipelines WHERE id=$1`, id).Scan(&name, &defJSON); err == nil {
			var p Pipeline
			if err := json.Unmarshal(defJSON, &p); err == nil {
				p.ID = id
				p.Name = name
				return &p, true
			}
		}
		return nil, false
	}

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
	
	if s.db != nil {
		defJSON, _ := json.Marshal(p)
		if _, err := s.db.Exec(`INSERT INTO pipelines (id, name, definition) VALUES ($1, $2, $3)`, id, p.Name, defJSON); err != nil {
			log.Printf("Create pipeline db error: %v", err)
		}
		return p
	}
	
	s.pipelines[id] = p
	return p
}

func (s *Store) Update(id string, input PipelineInput) (*Pipeline, bool) {
	p := &Pipeline{
		ID:    id,
		Name:  input.Name,
		Nodes: input.Nodes,
		Edges: input.Edges,
	}

	if s.db != nil {
		defJSON, _ := json.Marshal(p)
		res, err := s.db.Exec(`UPDATE pipelines SET name=$1, definition=$2, updated_at=now() WHERE id=$3`, p.Name, defJSON, id)
		if err != nil {
			log.Printf("Update pipeline db error: %v", err)
			return nil, false
		}
		rowsAffected, _ := res.RowsAffected()
		return p, rowsAffected > 0
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	_, ok := s.pipelines[id]
	if !ok {
		return nil, false
	}
	s.pipelines[id] = p
	return p, true
}

func (s *Store) Delete(id string) bool {
	if s.db != nil {
		res, err := s.db.Exec(`DELETE FROM pipelines WHERE id=$1`, id)
		if err != nil {
			log.Printf("Delete pipeline db error: %v", err)
			return false
		}
		rowsAffected, _ := res.RowsAffected()
		return rowsAffected > 0
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	_, ok := s.pipelines[id]
	if !ok {
		return false
	}
	delete(s.pipelines, id)
	return true
}

