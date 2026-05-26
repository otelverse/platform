package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	migrate := flag.Bool("migrate", false, "run database migrations")
	flag.Parse()

	if *migrate {
		dsn := os.Getenv("CLICKHOUSE_DSN")
		if dsn == "" {
			dsn = "clickhouse://localhost:9000?username=default&password="
		}
		if err := RunMigrations(dsn); err != nil {
			log.Fatalf("migration failed: %v", err)
		}
		return
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", healthzHandler)

	addr := fmt.Sprintf(":%s", port)
	log.Printf("Starting platform server on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func healthzHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, `{"status":"ok"}`)
}
