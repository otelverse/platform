package alerting

import (
	"testing"
	"time"
)

func TestNotifierSilence(t *testing.T) {
	store := NewStore()
	notifier := NewNotifier(store)

	rule := AlertRule{
		ID:   "rule-1",
		Name: "Test Rule",
	}
	event := AlertEvent{
		State: "ALERTING",
	}
	channel := NotificationChannel{
		Type: "WEBHOOK",
		Config: map[string]interface{}{
			"url": "http://localhost:9999/does-not-exist",
		},
	}

	// Should not be silenced yet
	if notifier.isSilenced(rule, event) {
		t.Fatalf("Expected not silenced")
	}

	// Add an active silence that matches the rule name
	store.CreateSilence(SilenceRule{
		StartsAt: time.Now().Add(-1 * time.Hour),
		EndsAt:   time.Now().Add(1 * time.Hour),
		Matchers: []Matcher{
			{Key: "alertname", Value: "Test Rule"},
		},
	})

	if !notifier.isSilenced(rule, event) {
		t.Fatalf("Expected to be silenced")
	}

	// Should return nil (no error) because it's silenced, skipping HTTP
	err := notifier.SendNotification(channel, rule, event)
	if err != nil {
		t.Fatalf("Expected nil error for silenced notification, got %v", err)
	}
}
