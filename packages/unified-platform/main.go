package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/ClickHouse/clickhouse-go/v2"
)

func main() {

	otlpAddr := flag.String("otlp-addr", ":4317", "OTLP gRPC receiver address")
	flag.Parse()

	clickhouseDSN := os.Getenv("CLICKHOUSE_DSN")
	if clickhouseDSN == "" {
		clickhouseDSN = "clickhouse://localhost:9000?username=default&password="
	}

	var db *sql.DB
	if err := RunMigrations(clickhouseDSN); err != nil {
		log.Printf("migration error (ignoring if already exists): %v", err)
	}

	var err error
	db, err = sql.Open("clickhouse", clickhouseDSN)
	if err != nil {
		log.Fatalf("failed to open clickhouse connection: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Printf("warning: clickhouse not reachable: %v", err)
	}

	otlpServer, err := StartOTLPReceiver(db, *otlpAddr)
	if err != nil {
		log.Fatalf("failed to start OTLP receiver: %v", err)
	}
	defer otlpServer.GracefulStop()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	vmURL := os.Getenv("VICTORIAMETRICS_URL")
	if vmURL == "" {
		vmURL = "http://localhost:8428"
	}

	gqlResolver := NewGraphQLResolver(db, vmURL)
	gqlResolver.StartBackgroundTasks(context.Background())

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", healthzHandler)
	mux.Handle("/graphql", corsMiddleware(gqlResolver))

	addr := fmt.Sprintf(":%s", port)
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
