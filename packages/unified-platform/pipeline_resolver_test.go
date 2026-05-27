package main

import (
	"context"
	"testing"
)

func TestPipelineResolvePipelines(t *testing.T) {
	resolver := NewGraphQLResolver(nil, "http://localhost:8428")
	result, err := resolver.resolvePipelines(context.Background(), nil)
	if err != nil {
		t.Fatalf("resolvePipelines failed: %v", err)
	}
	data, ok := result.(map[string]interface{})
	if !ok {
		t.Fatal("expected map result")
	}
	pipelines, ok := data["pipelines"].([]interface{})
	if !ok {
		t.Fatal("expected pipelines list")
	}
	if len(pipelines) < 1 {
		t.Fatal("expected at least 1 pipeline")
	}
}

func TestPipelineResolvePipeline(t *testing.T) {
	resolver := NewGraphQLResolver(nil, "http://localhost:8428")
	vars := map[string]interface{}{"id": "default"}
	result, err := resolver.resolvePipeline(context.Background(), vars)
	if err != nil {
		t.Fatalf("resolvePipeline failed: %v", err)
	}
	data, ok := result.(map[string]interface{})
	if !ok {
		t.Fatal("expected map result")
	}
	if data["pipeline"] == nil {
		t.Fatal("expected pipeline to be found")
	}
}

func TestPipelineResolvePipelineNotFound(t *testing.T) {
	resolver := NewGraphQLResolver(nil, "http://localhost:8428")
	vars := map[string]interface{}{"id": "nonexistent"}
	result, err := resolver.resolvePipeline(context.Background(), vars)
	if err != nil {
		t.Fatalf("resolvePipeline failed: %v", err)
	}
	data, ok := result.(map[string]interface{})
	if !ok {
		t.Fatal("expected map result")
	}
	if data["pipeline"] != nil {
		t.Fatal("expected nil for nonexistent pipeline")
	}
}

func TestPipelineResolveCreate(t *testing.T) {
	resolver := NewGraphQLResolver(nil, "http://localhost:8428")
	input := map[string]interface{}{
		"name":  "New Pipeline",
		"nodes": []interface{}{},
		"edges": []interface{}{},
	}
	vars := map[string]interface{}{"input": input}
	result, err := resolver.resolvePipelineCreate(context.Background(), vars)
	if err != nil {
		t.Fatalf("resolvePipelineCreate failed: %v", err)
	}
	data, ok := result.(map[string]interface{})
	if !ok {
		t.Fatal("expected map result")
	}
	p, ok := data["pipelineCreate"].(map[string]interface{})
	if !ok {
		t.Fatal("expected pipeline in result")
	}
	if p["name"] != "New Pipeline" {
		t.Fatalf("expected 'New Pipeline', got '%v'", p["name"])
	}
}

func TestPipelineResolveDelete(t *testing.T) {
	resolver := NewGraphQLResolver(nil, "http://localhost:8428")

	createInput := map[string]interface{}{
		"name":  "Delete Me",
		"nodes": []interface{}{},
		"edges": []interface{}{},
	}
	createResult, _ := resolver.resolvePipelineCreate(context.Background(), map[string]interface{}{"input": createInput})
	p := createResult.(map[string]interface{})["pipelineCreate"].(map[string]interface{})

	vars := map[string]interface{}{"id": p["id"]}
	result, err := resolver.resolvePipelineDelete(context.Background(), vars)
	if err != nil {
		t.Fatalf("resolvePipelineDelete failed: %v", err)
	}
	data, ok := result.(map[string]interface{})
	if !ok {
		t.Fatal("expected map result")
	}
	if data["pipelineDelete"] != true {
		t.Fatal("expected delete to return true")
	}
}

func TestPipelineExecuteQueryPipelines(t *testing.T) {
	resolver := NewGraphQLResolver(nil, "http://localhost:8428")
	result, err := resolver.executeQuery(context.Background(), "query { pipelines { id name } }", nil)
	if err != nil {
		t.Fatalf("executeQuery failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}
}

func TestPipelineExecuteMutationCreate(t *testing.T) {
	resolver := NewGraphQLResolver(nil, "http://localhost:8428")
	input := map[string]interface{}{
		"name":  "Mutation Pipeline",
		"nodes": []interface{}{},
		"edges": []interface{}{},
	}
	vars := map[string]interface{}{"input": input}
	result, err := resolver.executeQuery(context.Background(), "mutation pipelineCreate($input: PipelineInput!) { pipelineCreate(input: $input) { id name } }", vars)
	if err != nil {
		t.Fatalf("executeQuery mutation failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}
}
