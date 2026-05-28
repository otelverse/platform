package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
)

type ChaosExperiment struct {
	ID             string                 `json:"id"`
	Name           string                 `json:"name"`
	TargetService  string                 `json:"targetService"`
	TargetSpanName *string                `json:"targetSpanName"`
	FaultType      string                 `json:"faultType"`
	Config         map[string]interface{} `json:"config"`
	Status         string                 `json:"status"`
	StartTime      string                 `json:"startTime"`
	EndTime        *string                `json:"endTime"`
	Creator        string                 `json:"creator"`
}

type ChaosStore struct {
	db          *sql.DB
	mu          sync.RWMutex
	experiments map[string]*ChaosExperiment
}

func NewChaosStore(db *sql.DB) *ChaosStore {
	return &ChaosStore{
		db:          db,
		experiments: make(map[string]*ChaosExperiment),
	}
}

func (s *ChaosStore) List() []*ChaosExperiment {
	if s.db != nil {
		rows, err := s.db.Query(`SELECT id, name, target_service, target_span_name, fault_type, config, status, start_time, end_time, creator FROM chaos_experiments`)
		if err != nil {
			log.Printf("List chaos db error: %v", err)
			return nil
		}
		defer rows.Close()
		var list []*ChaosExperiment
		for rows.Next() {
			var e ChaosExperiment
			var configJSON []byte
			var st, et sql.NullTime
			var tsn, creator sql.NullString
			if err := rows.Scan(&e.ID, &e.Name, &e.TargetService, &tsn, &e.FaultType, &configJSON, &e.Status, &st, &et, &creator); err == nil {
				json.Unmarshal(configJSON, &e.Config)
				if tsn.Valid {
					e.TargetSpanName = &tsn.String
				}
				if creator.Valid {
					e.Creator = creator.String
				}
				if st.Valid {
					e.StartTime = st.Time.Format(time.RFC3339)
				}
				if et.Valid {
					ts := et.Time.Format(time.RFC3339)
					e.EndTime = &ts
				}
				list = append(list, &e)
			}
		}
		return list
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	list := make([]*ChaosExperiment, 0, len(s.experiments))
	for _, e := range s.experiments {
		list = append(list, e)
	}
	return list
}

func (s *ChaosStore) Get(id string) (*ChaosExperiment, bool) {
	if s.db != nil {
		var e ChaosExperiment
		var configJSON []byte
		var st, et sql.NullTime
		var tsn, creator sql.NullString
		err := s.db.QueryRow(`SELECT name, target_service, target_span_name, fault_type, config, status, start_time, end_time, creator FROM chaos_experiments WHERE id=$1`, id).
			Scan(&e.Name, &e.TargetService, &tsn, &e.FaultType, &configJSON, &e.Status, &st, &et, &creator)
		if err != nil {
			return nil, false
		}
		e.ID = id
		json.Unmarshal(configJSON, &e.Config)
		if tsn.Valid {
			e.TargetSpanName = &tsn.String
		}
		if creator.Valid {
			e.Creator = creator.String
		}
		if st.Valid {
			e.StartTime = st.Time.Format(time.RFC3339)
		}
		if et.Valid {
			ts := et.Time.Format(time.RFC3339)
			e.EndTime = &ts
		}
		return &e, true
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	e, ok := s.experiments[id]
	return e, ok
}

func (s *ChaosStore) Create(input map[string]interface{}) (*ChaosExperiment, error) {
	id := uuid.New().String()
	name, _ := input["name"].(string)
	targetService, _ := input["targetService"].(string)
	
	var targetSpanName *string
	if ts, ok := input["targetSpanName"].(string); ok && ts != "" {
		targetSpanName = &ts
	}

	faultType, _ := input["faultType"].(string)
	config, _ := input["config"].(map[string]interface{})

	exp := &ChaosExperiment{
		ID:             id,
		Name:           name,
		TargetService:  targetService,
		TargetSpanName: targetSpanName,
		FaultType:      faultType,
		Config:         config,
		Status:         "SCHEDULED",
		StartTime:      time.Now().Format(time.RFC3339),
		Creator:        "Admin",
	}

	if s.db != nil {
		configJSON, _ := json.Marshal(config)
		_, err := s.db.Exec(`INSERT INTO chaos_experiments (id, name, target_service, target_span_name, fault_type, config, status, start_time, creator) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
			id, name, targetService, targetSpanName, faultType, configJSON, exp.Status, time.Now(), exp.Creator)
		if err != nil {
			log.Printf("Create chaos db error: %v", err)
		}
		return exp, nil
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.experiments[id] = exp
	return exp, nil
}

func (s *ChaosStore) Start(id string) (*ChaosExperiment, error) {
	if s.db != nil {
		_, err := s.db.Exec(`UPDATE chaos_experiments SET status='RUNNING' WHERE id=$1`, id)
		if err != nil {
			return nil, err
		}
		e, ok := s.Get(id)
		if !ok {
			return nil, fmt.Errorf("experiment not found")
		}
		return e, nil
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.experiments[id]
	if !ok {
		return nil, fmt.Errorf("experiment not found")
	}
	e.Status = "RUNNING"
	return e, nil
}

func (s *ChaosStore) Cancel(id string) (*ChaosExperiment, error) {
	nowStr := time.Now().Format(time.RFC3339)
	if s.db != nil {
		_, err := s.db.Exec(`UPDATE chaos_experiments SET status='CANCELLED', end_time=$1 WHERE id=$2`, time.Now(), id)
		if err != nil {
			return nil, err
		}
		e, ok := s.Get(id)
		if !ok {
			return nil, fmt.Errorf("experiment not found")
		}
		return e, nil
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.experiments[id]
	if !ok {
		return nil, fmt.Errorf("experiment not found")
	}
	e.Status = "CANCELLED"
	e.EndTime = &nowStr
	return e, nil
}

// Resolver extensions for GraphQLResolver

func (r *GraphQLResolver) resolveChaosExperiments(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	exps := r.chaosStore.List()
	return map[string]interface{}{"chaosExperiments": exps}, nil
}

func (r *GraphQLResolver) resolveChaosExperiment(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}
	e, ok := r.chaosStore.Get(id)
	if !ok {
		return map[string]interface{}{"chaosExperiment": nil}, nil
	}
	return map[string]interface{}{"chaosExperiment": e}, nil
}

func (r *GraphQLResolver) resolveChaosCreateExperiment(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	inputRaw, ok := vars["input"]
	if !ok {
		return nil, fmt.Errorf("input is required")
	}
	inputMap, ok := inputRaw.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid input format")
	}
	exp, err := r.chaosStore.Create(inputMap)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"chaosCreateExperiment": exp}, nil
}

func (r *GraphQLResolver) resolveChaosStartExperiment(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	exp, err := r.chaosStore.Start(id)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"chaosStartExperiment": exp}, nil
}

func (r *GraphQLResolver) resolveChaosCancelExperiment(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	exp, err := r.chaosStore.Cancel(id)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"chaosCancelExperiment": exp}, nil
}

func (r *GraphQLResolver) resolveChaosBlastRadius(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	expID, _ := vars["experimentId"].(string)
	if expID == "" {
		return nil, fmt.Errorf("experimentId is required")
	}

	// This is where we query ClickHouse for the blast radius!
	// We want to find spans that have chaos.experiment_id = expID
	// and aggregate by ServiceName.

	query := `
		SELECT 
			ServiceName,
			count() as spanCount,
			countIf(StatusCode = 2) as errorCount,
			avg(Duration) as avgDuration
		FROM otel_traces
		WHERE Attributes['chaos.experiment_id'] = ?
		GROUP BY ServiceName
	`
	rows, err := r.db.QueryContext(ctx, query, expID)
	if err != nil {
		return nil, fmt.Errorf("failed to query blast radius: %w", err)
	}
	defer rows.Close()

	var affected []map[string]interface{}
	totalSpans := 0
	var totalAvg float64

	for rows.Next() {
		var serviceName string
		var spanCount int
		var errorCount int
		var avgDuration float64
		if err := rows.Scan(&serviceName, &spanCount, &errorCount, &avgDuration); err != nil {
			return nil, err
		}
		
		// For the MVP, we fake latencyIncreasePct (it would normally require a baseline query)
		// We'll just say the average duration is the increase in ms
		latencyIncreasePct := avgDuration / 1000.0 // rough fake

		affected = append(affected, map[string]interface{}{
			"serviceName": serviceName,
			"spanCount": spanCount,
			"errorCount": errorCount,
			"latencyIncreasePct": latencyIncreasePct,
		})
		totalSpans += spanCount
		totalAvg += latencyIncreasePct
	}

	avgLatInc := 0.0
	if len(affected) > 0 {
		avgLatInc = totalAvg / float64(len(affected))
	}

	return map[string]interface{}{
		"chaosBlastRadius": map[string]interface{}{
			"affectedServices": affected,
			"totalAffectedSpans": totalSpans,
			"averageLatencyIncrease": avgLatInc,
		},
	}, nil
}
