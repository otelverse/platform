package main

import (
	"context"
	"strings"
	"testing"
)

func TestPipelineIntegration_FullCRUD(t *testing.T) {
	resolver := NewGraphQLResolver(nil, "http://localhost:8428")

	ctx := context.Background()

	pipelinesResult, err := resolver.resolvePipelines(ctx, nil)
	if err != nil {
		t.Fatalf("list failed: %v", err)
	}
	pipelines := pipelinesResult.(map[string]interface{})["pipelines"].([]interface{})
	if len(pipelines) != 1 {
		t.Fatalf("expected 1 pipeline initially, got %d", len(pipelines))
	}

	createInput := map[string]interface{}{
		"name": "Integration Test Pipeline",
		"nodes": []interface{}{
			map[string]interface{}{
				"id":         "n1",
				"type":       "RECEIVER_OTLP",
				"label":      "OTLP In",
				"properties": map[string]interface{}{"endpoint": "0.0.0.0:4317"},
				"position":   map[string]interface{}{"x": float64(100), "y": float64(100)},
			},
			map[string]interface{}{
				"id":         "n2",
				"type":       "PROCESSOR_BATCH",
				"label":      "Batch",
				"properties": map[string]interface{}{},
				"position":   map[string]interface{}{"x": float64(300), "y": float64(100)},
			},
			map[string]interface{}{
				"id":         "n3",
				"type":       "EXPORTER_LOGGING",
				"label":      "Log Out",
				"properties": map[string]interface{}{"verbosity": "basic"},
				"position":   map[string]interface{}{"x": float64(500), "y": float64(100)},
			},
		},
		"edges": []interface{}{
			map[string]interface{}{
				"id":     "e1",
				"source": "n1",
				"target": "n2",
			},
			map[string]interface{}{
				"id":     "e2",
				"source": "n2",
				"target": "n3",
			},
		},
	}
	createVars := map[string]interface{}{"input": createInput}

	createResult, err := resolver.resolvePipelineCreate(ctx, createVars)
	if err != nil {
		t.Fatalf("create failed: %v", err)
	}
	createdPipeline := createResult.(map[string]interface{})["pipelineCreate"].(map[string]interface{})
	createdID := createdPipeline["id"].(string)
	if createdID == "" {
		t.Fatal("expected non-empty created pipeline ID")
	}
	if createdPipeline["name"] != "Integration Test Pipeline" {
		t.Fatalf("expected 'Integration Test Pipeline', got '%v'", createdPipeline["name"])
	}

	getVars := map[string]interface{}{"id": createdID}
	getResult, err := resolver.resolvePipeline(ctx, getVars)
	if err != nil {
		t.Fatalf("get failed: %v", err)
	}
	pipeline := getResult.(map[string]interface{})["pipeline"].(map[string]interface{})
	if pipeline["name"] != "Integration Test Pipeline" {
		t.Fatalf("expected 'Integration Test Pipeline', got '%v'", pipeline["name"])
	}

	pipelinesResult2, err := resolver.resolvePipelines(ctx, nil)
	if err != nil {
		t.Fatalf("list after create failed: %v", err)
	}
	pipelines2 := pipelinesResult2.(map[string]interface{})["pipelines"].([]interface{})
	if len(pipelines2) != 2 {
		t.Fatalf("expected 2 pipelines after create, got %d", len(pipelines2))
	}

	updateInput := map[string]interface{}{
		"name":  "Updated Pipeline Name",
		"nodes": []interface{}{},
		"edges": []interface{}{},
	}
	updateVars := map[string]interface{}{"id": createdID, "input": updateInput}
	updateResult, err := resolver.resolvePipelineUpdate(ctx, updateVars)
	if err != nil {
		t.Fatalf("update failed: %v", err)
	}
	updated := updateResult.(map[string]interface{})["pipelineUpdate"].(map[string]interface{})
	if updated["name"] != "Updated Pipeline Name" {
		t.Fatalf("expected 'Updated Pipeline Name', got '%v'", updated["name"])
	}

	deleteVars := map[string]interface{}{"id": createdID}
	deleteResult, err := resolver.resolvePipelineDelete(ctx, deleteVars)
	if err != nil {
		t.Fatalf("delete failed: %v", err)
	}
	deleted := deleteResult.(map[string]interface{})["pipelineDelete"].(bool)
	if !deleted {
		t.Fatal("expected delete to return true")
	}
}

func TestPipelineIntegration_Validate(t *testing.T) {
	resolver := NewGraphQLResolver(nil, "http://localhost:8428")

	ctx := context.Background()

	createInput := map[string]interface{}{
		"name":  "Validatable Pipeline",
		"nodes": []interface{}{},
		"edges": []interface{}{},
	}
	createResult, _ := resolver.resolvePipelineCreate(ctx, map[string]interface{}{"input": createInput})
	created := createResult.(map[string]interface{})["pipelineCreate"].(map[string]interface{})
	id := created["id"].(string)

	validateVars := map[string]interface{}{"id": id}
	validateResult, err := resolver.resolvePipelineValidate(ctx, validateVars)
	if err != nil {
		t.Fatalf("validate failed: %v", err)
	}
	validation := validateResult.(map[string]interface{})["pipelineValidate"].(map[string]interface{})
	valid := validation["valid"].(bool)
	if valid {
		t.Fatal("expected empty pipeline to be invalid")
	}
}

func TestPipelineIntegration_ExportYAML(t *testing.T) {
	resolver := NewGraphQLResolver(nil, "http://localhost:8428")
	ctx := context.Background()

	exportVars := map[string]interface{}{"id": "default"}
	exportResult, err := resolver.resolvePipelineExportYAML(ctx, exportVars)
	if err != nil {
		t.Fatalf("export yaml failed: %v", err)
	}
	yamlStr := exportResult.(map[string]interface{})["pipelineExportYAML"].(string)
	if !strings.Contains(yamlStr, "receivers:") {
		t.Fatal("exported YAML missing receivers section")
	}
	if !strings.Contains(yamlStr, "processors:") {
		t.Fatal("exported YAML missing processors section")
	}
	if !strings.Contains(yamlStr, "exporters:") {
		t.Fatal("exported YAML missing exporters section")
	}
	if !strings.Contains(yamlStr, "service:") {
		t.Fatal("exported YAML missing service section")
	}
}

func TestPipelineIntegration_ExecuteQuery(t *testing.T) {
	resolver := NewGraphQLResolver(nil, "http://localhost:8428")
	ctx := context.Background()

	result, err := resolver.executeQuery(ctx, "query { pipelines { id name } }", nil)
	if err != nil {
		t.Fatalf("query pipelines via executeQuery failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	result, err = resolver.executeQuery(ctx, "query ValidatePipeline($id: ID!) { pipelineValidate(id: $id) { valid errors } }", map[string]interface{}{"id": "default"})
	if err != nil {
		t.Fatalf("query validate via executeQuery failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}
}
