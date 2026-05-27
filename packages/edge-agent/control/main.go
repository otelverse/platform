package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
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

// Stubs for now
func registerAgent(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"id": "agent-123", "status": "registered"})
}

func heartbeatAgent(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func listAgents(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode([]map[string]string{})
}

func getAgentConfig(w http.ResponseWriter, r *http.Request) {
	// Returns a default YAML config
	configYaml := `agent:
  collector_endpoint: "http://platform.otelverse.io:4317"
  local_listen_port: 4317
  buffer_path: "./otel_buffer.db"
  sync_interval_secs: 30
`
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"config_yaml": configYaml})
}

func updateAgentConfig(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}
