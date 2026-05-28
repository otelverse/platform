package main

import (
	"database/sql"
	"log"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

func initDB() {
	var err error
	// Reuse session replay DB or a default local postgres
	db, err = sql.Open("postgres", "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable")
	if err != nil {
		log.Printf("Failed to connect to postgres: %v. Using in-memory fallback.", err)
		return
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS edge_agents (
			id TEXT PRIMARY KEY,
			status TEXT,
			last_heartbeat TIMESTAMP,
			config_yaml TEXT
		)
	`)
	if err != nil {
		log.Printf("Failed to create edge_agents table: %v. Using in-memory fallback.", err)
		db = nil
	}
}

// In-memory fallback
var memoryAgents = make(map[string]map[string]interface{})

func saveAgent(id, status, configYaml string) {
	if db != nil {
		_, _ = db.Exec(`
			INSERT INTO edge_agents (id, status, last_heartbeat, config_yaml) 
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, config_yaml = EXCLUDED.config_yaml
		`, id, status, time.Now(), configYaml)
	} else {
		memoryAgents[id] = map[string]interface{}{
			"id":             id,
			"status":         status,
			"last_heartbeat": time.Now(),
			"config_yaml":    configYaml,
		}
	}
}

func updateHeartbeat(id string) {
	if db != nil {
		_, _ = db.Exec(`UPDATE edge_agents SET last_heartbeat = $1, status = 'online' WHERE id = $2`, time.Now(), id)
	} else {
		if agent, ok := memoryAgents[id]; ok {
			agent["last_heartbeat"] = time.Now()
			agent["status"] = "online"
		}
	}
}

func getAgents() []map[string]interface{} {
	var results []map[string]interface{}
	if db != nil {
		rows, err := db.Query(`SELECT id, status, last_heartbeat, config_yaml FROM edge_agents`)
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var id, status, config string
				var hb time.Time
				rows.Scan(&id, &status, &hb, &config)
				results = append(results, map[string]interface{}{
					"id": id, "status": status, "last_heartbeat": hb, "config_yaml": config,
				})
			}
		}
	} else {
		for _, v := range memoryAgents {
			results = append(results, v)
		}
	}
	return results
}

func getConfig(id string) string {
	if db != nil {
		var config string
		err := db.QueryRow(`SELECT config_yaml FROM edge_agents WHERE id = $1`, id).Scan(&config)
		if err == nil {
			return config
		}
	} else {
		if agent, ok := memoryAgents[id]; ok {
			if c, ok := agent["config_yaml"].(string); ok {
				return c
			}
		}
	}
	return "agent:\n  collector_endpoint: \"http://platform.otelverse.io:4317\"\n  local_listen_port: 4317\n  buffer_path: \"./otel_buffer.db\"\n  sync_interval_secs: 30\n"
}
