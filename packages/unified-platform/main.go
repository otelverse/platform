package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "net/http/pprof"

	_ "github.com/ClickHouse/clickhouse-go/v2"
	_ "github.com/lib/pq"
)

func main() {

	otlpAddr := flag.String("otlp-addr", ":4317", "OTLP gRPC receiver address")
	postgresDSNFlag := flag.String("postgres-dsn", "", "PostgreSQL DSN for persistence")
	pprofFlag := flag.Bool("pprof", false, "Enable pprof profiling on /debug/pprof")
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
	// Setup ClickHouse connection pooling
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(time.Hour)
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Printf("warning: clickhouse not reachable: %v", err)
	}

	// Postgres Setup
	postgresDSN := *postgresDSNFlag
	if postgresDSN == "" {
		postgresDSN = os.Getenv("POSTGRES_DSN")
	}

	var pgDB *sql.DB
	if postgresDSN != "" {
		log.Printf("Connecting to Postgres...")
		pgDB, err = sql.Open("postgres", postgresDSN)
		if err == nil {
			if err := pgDB.Ping(); err != nil {
				log.Printf("warning: postgres not reachable: %v", err)
				pgDB.Close()
				pgDB = nil
			} else {
				if err := RunPostgresMigrations(postgresDSN); err != nil {
					log.Printf("warning: postgres migration error: %v", err)
				}
			}
		} else {
			log.Printf("warning: failed to open postgres: %v", err)
			pgDB = nil
		}
	} else {
		log.Println("warning: POSTGRES_DSN not set. Falling back to in-memory stores.")
	}

	if pgDB != nil {
		defer pgDB.Close()
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

	gqlResolver := NewGraphQLResolver(db, pgDB, vmURL)
	gqlResolver.StartBackgroundTasks(context.Background())

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", healthzHandler(db, pgDB))
	mux.Handle("/graphql", corsMiddleware(gqlResolver))
	
	if *pprofFlag {
		importPprof(mux)
	}

	addr := fmt.Sprintf(":%s", port)
	log.Printf("Starting platform HTTP server on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("HTTP server failed: %v", err)
	}
}

func healthzHandler(db *sql.DB, pgDB *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := db.Ping(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			fmt.Fprintf(w, `{"status":"error", "error":"clickhouse unreachable"}`)
			return
		}
		if pgDB != nil {
			if err := pgDB.Ping(); err != nil {
				w.WriteHeader(http.StatusServiceUnavailable)
				fmt.Fprintf(w, `{"status":"error", "error":"postgres unreachable"}`)
				return
			}
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `{"status":"ok"}`)
	}
}

func importPprof(mux *http.ServeMux) {
	// We need to route them in our custom mux if we don't use the default
	mux.Handle("/debug/pprof/", http.DefaultServeMux)
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
