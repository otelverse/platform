package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	_ "github.com/marcboeker/go-duckdb"
)

func main() {
	port := flag.String("port", "8080", "HTTP port")
	otlpAddr := flag.String("otlp-addr", ":4317", "OTLP gRPC receiver address")
	dataDir := flag.String("data-dir", "", "data directory (default: ~/.otelverse)")
	flag.Parse()

	if *dataDir == "" {
		home, _ := os.UserHomeDir()
		*dataDir = filepath.Join(home, ".otelverse")
	}
	os.MkdirAll(*dataDir, 0755)

	dbPath := filepath.Join(*dataDir, "data.db")
	log.Printf("Opening DuckDB database: %s", dbPath)

	db, err := sql.Open("duckdb", dbPath)
	if err != nil {
		log.Fatalf("failed to open duckdb: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping duckdb: %v", err)
	}

	if err := RunMigrations(db); err != nil {
		log.Fatalf("migration failed: %v", err)
	}

	otlpServer, err := StartOTLPReceiver(db, *otlpAddr)
	if err != nil {
		log.Fatalf("failed to start OTLP receiver: %v", err)
	}
	defer otlpServer.GracefulStop()

	gqlResolver := NewGraphQLResolver(db)

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", healthzHandler)
	mux.Handle("/graphql", corsMiddleware(gqlResolver))

	addr := fmt.Sprintf(":%s", *port)
	log.Printf("Starting platform HTTP server on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("HTTP server failed: %v", err)
	}
}

func healthzHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, `{"status":"ok"}`)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
