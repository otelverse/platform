package alerting

import (
	"context"
	"testing"
	"time"
)

type mockExecutor struct {
	count int
	err   error
}

func (m *mockExecutor) ExecuteQueryCount(ctx context.Context, queryStr string) (int, error) {
	return m.count, m.err
}

type mockNotifier struct {
	sent int
}

func (m *mockNotifier) SendNotification(channel NotificationChannel, rule AlertRule, event AlertEvent) error {
	m.sent++
	return nil
}

func TestEvaluator(t *testing.T) {
	store := NewStore()
	executor := &mockExecutor{count: 10, err: nil}
	notifier := &mockNotifier{sent: 0}

	evaluator := &Evaluator{
		store:    store,
		executor: executor,
		notifier: notifier,
	}

	// Create a channel
	ch := store.CreateChannel(NotificationChannel{
		Name: "Test Channel",
		Type: "WEBHOOK",
	})

	// Create a rule that should trigger ALERTING state
	rule := store.CreateRule(AlertRule{
		Name:            "High Error Rate",
		Query:           "FIND traces WHERE status = 'error'",
		IntervalSeconds: 60,
		Condition: map[string]interface{}{
			"type":      "COUNT_GT",
			"threshold": float64(5),
		},
		NotificationChannelIDs: []string{ch.ID},
	})

	ctx := context.Background()

	// Evaluate manually
	evaluator.EvaluateAll(ctx)

	// Check if state changed to ALERTING
	updatedRule, _ := store.GetRule(rule.ID)
	if updatedRule.State != "ALERTING" {
		t.Fatalf("Expected rule state to be ALERTING, got %s", updatedRule.State)
	}

	// Check if event was created
	events := store.ListEvents(&rule.ID, 10)
	if len(events) != 1 {
		t.Fatalf("Expected 1 event, got %d", len(events))
	}
	if events[0].State != "ALERTING" {
		t.Fatalf("Expected event state to be ALERTING, got %s", events[0].State)
	}
	if !events[0].NotificationSent {
		t.Fatalf("Expected notification to be sent")
	}

	if notifier.sent != 1 {
		t.Fatalf("Expected 1 notification sent, got %d", notifier.sent)
	}

	// Change executor to return a count below threshold
	executor.count = 2

	// We need to bypass the interval check by zeroing LastEvaluatedAt
	updatedRule.LastEvaluatedAt = nil
	store.UpdateRule(updatedRule.ID, *updatedRule)

	// Evaluate again
	evaluator.EvaluateAll(ctx)

	// Check if state changed to OK
	finalRule, _ := store.GetRule(rule.ID)
	if finalRule.State != "OK" {
		t.Fatalf("Expected rule state to be OK, got %s", finalRule.State)
	}

	events = store.ListEvents(&rule.ID, 10)
	if len(events) != 2 {
		t.Fatalf("Expected 2 events, got %d", len(events))
	}
	if events[0].State != "OK" { // Latest event is first
		t.Fatalf("Expected newest event state to be OK, got %s", events[0].State)
	}
	if notifier.sent != 2 {
		t.Fatalf("Expected 2 notifications sent, got %d", notifier.sent)
	}
}

func TestEvaluatorInterval(t *testing.T) {
	store := NewStore()
	executor := &mockExecutor{count: 10, err: nil}
	notifier := &mockNotifier{sent: 0}

	evaluator := &Evaluator{
		store:    store,
		executor: executor,
		notifier: notifier,
	}

	rule := store.CreateRule(AlertRule{
		Name:            "High Error Rate",
		Query:           "FIND traces WHERE status = 'error'",
		IntervalSeconds: 60,
		Condition: map[string]interface{}{
			"type":      "COUNT_GT",
			"threshold": float64(5),
		},
	})

	ctx := context.Background()

	// 1st Eval
	evaluator.EvaluateAll(ctx)
	if notifier.sent != 0 {
		// Wait, we didn't add channels so notifier is 0, but rule state changes
	}
	
	updatedRule, _ := store.GetRule(rule.ID)
	if updatedRule.State != "ALERTING" {
		t.Fatalf("Expected ALERTING")
	}

	// Set executor to 2, it should recover to OK, BUT interval is not met
	executor.count = 2
	evaluator.EvaluateAll(ctx)
	
	// Rule should STILL be ALERTING
	updatedRule2, _ := store.GetRule(rule.ID)
	if updatedRule2.State != "ALERTING" {
		t.Fatalf("Expected rule to still be ALERTING due to interval")
	}

	// Now time travel by setting last evaluated to 61 seconds ago
	past := time.Now().Add(-61 * time.Second)
	updatedRule2.LastEvaluatedAt = &past
	store.UpdateRule(updatedRule2.ID, *updatedRule2)

	evaluator.EvaluateAll(ctx)

	// Now it should be OK
	updatedRule3, _ := store.GetRule(rule.ID)
	if updatedRule3.State != "OK" {
		t.Fatalf("Expected OK after interval met")
	}
}
