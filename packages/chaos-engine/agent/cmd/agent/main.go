package main

import (
	"log"
	"net"
	"net/http"
	"os"

	coltracepb "go.opentelemetry.io/proto/otlp/collector/trace/v1"
	"google.golang.org/grpc"

	"github.com/otelverse/chaos-engine/agent/internal/proxy"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4319"
	}

	upstream := os.Getenv("OTLP_ENDPOINT")
	if upstream == "" {
		upstream = "localhost:4317" // Default upstream collector
	}

	configPath := os.Getenv("EXPERIMENT_CONFIG")
	platformURL := os.Getenv("PLATFORM_GRAPHQL_URL")

	log.Printf("Starting Chaos Agent on port %s forwarding to %s", port, upstream)

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()

	chaosProxy, err := proxy.NewChaosProxy(upstream, configPath, platformURL)
	if err != nil {
		log.Fatalf("failed to create chaos proxy: %v", err)
	}

	coltracepb.RegisterTraceServiceServer(grpcServer, chaosProxy)

	// Also start a simple health server
	go func() {
		http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("OK"))
		})
		http.ListenAndServe(":8084", nil)
	}()

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
