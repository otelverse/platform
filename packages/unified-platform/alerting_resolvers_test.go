package main

import (
	"context"
	"testing"

	"github.com/otelverse/unified-platform/alerting"
)

func TestAlertingResolvers(t *testing.T) {
	resolver := NewGraphQLResolver(nil, nil, "http://localhost:8428") // DB not strictly needed for just alerting in-memory store tests
	ctx := context.Background()

	// 1. Create Alert Rule
	createRuleVars := map[string]interface{}{
		"input": map[string]interface{}{
			"name":            "High Error Rate",
			"query":           "FIND traces WHERE status = 'error'",
			"intervalSeconds": float64(60),
			"condition": map[string]interface{}{
				"type":      "COUNT_GT",
				"threshold": float64(5),
			},
		},
	}
	res, err := resolver.resolveCreateAlertRule(ctx, createRuleVars)
	if err != nil {
		t.Fatalf("resolveCreateAlertRule failed: %v", err)
	}

	ruleMap := res.(map[string]interface{})["createAlertRule"].(*alerting.AlertRule)
	if ruleMap.Name != "High Error Rate" {
		t.Fatalf("Expected High Error Rate, got %s", ruleMap.Name)
	}
	ruleID := ruleMap.ID

	// 2. Query Alert Rules
	listRes, err := resolver.resolveAlertRules(ctx, nil)
	if err != nil {
		t.Fatalf("resolveAlertRules failed: %v", err)
	}
	rules := listRes.(map[string]interface{})["alertRules"].([]*alerting.AlertRule)
	if len(rules) != 1 {
		t.Fatalf("Expected 1 rule, got %d", len(rules))
	}

	// 3. Delete Alert Rule
	_, err = resolver.resolveDeleteAlertRule(ctx, map[string]interface{}{"id": ruleID})
	if err != nil {
		t.Fatalf("resolveDeleteAlertRule failed: %v", err)
	}

	listRes2, _ := resolver.resolveAlertRules(ctx, nil)
	rules2 := listRes2.(map[string]interface{})["alertRules"].([]*alerting.AlertRule)
	if len(rules2) != 0 {
		t.Fatalf("Expected 0 rules after deletion, got %d", len(rules2))
	}
}
