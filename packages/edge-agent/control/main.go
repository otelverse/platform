package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	initDB()

	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	r.Post("/v1/agents", registerAgent)
	r.Post("/v1/agents/{id}/heartbeat", heartbeatAgent)
	r.Get("/v1/agents", listAgents)
	r.Get("/v1/agent/{id}/config", getAgentConfig)
	r.Put("/v1/agents/{id}/config", updateAgentConfig)

	log.Println("Starting Edge Agent Control Plane on :8082")
	if err := http.ListenAndServe(":8082", r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// Handlers
func registerAgent(w http.ResponseWriter, r *http.Request) {
	id := "agent-123" // In a real system, parse from request or generate UUID
	config := "agent:\n  collector_endpoint: \"http://platform.otelverse.io:4317\"\n  local_listen_port: 4317\n  buffer_path: \"./otel_buffer.db\"\n  sync_interval_secs: 30\n"
	saveAgent(id, "registered", config)
	
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"id": id, "status": "registered", "config_yaml": config})
}

func heartbeatAgent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	updateHeartbeat(id)
	w.WriteHeader(http.StatusOK)
}

func listAgents(w http.ResponseWriter, r *http.Request) {
	agents := getAgents()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(agents)
}

func getAgentConfig(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	configYaml := getConfig(id)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"config_yaml": configYaml})
}

func updateAgentConfig(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req struct {
		ConfigYaml string `json:"config_yaml"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err == nil {
		saveAgent(id, "updated", req.ConfigYaml)
	}
	w.WriteHeader(http.StatusOK)
}
