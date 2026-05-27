package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/otelverse/session-replay-service/internal/api"
	"github.com/otelverse/session-replay-service/internal/storage"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	r := mux.NewRouter()

	dbDSN := os.Getenv("POSTGRES_DSN")
	dataDir := os.Getenv("DATA_DIR")
	store, err := storage.NewStorage(dbDSN, dataDir)
	if err != nil {
		log.Fatalf("failed to initialize storage: %v", err)
	}

	apiServer := api.NewAPI(store)
	apiServer.RegisterRoutes(r)

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	handler := c.Handler(r)

	log.Printf("Session Replay Service starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
