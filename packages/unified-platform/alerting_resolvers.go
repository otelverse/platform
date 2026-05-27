package main

import (
	"context"
	"fmt"
	"time"

	"github.com/otelverse/unified-platform/alerting"
)

// -- Queries --

func (r *GraphQLResolver) resolveAlertRules(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	rules := r.alertStore.ListRules()
	return map[string]interface{}{"alertRules": rules}, nil
}

func (r *GraphQLResolver) resolveAlertRule(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}
	rule, ok := r.alertStore.GetRule(id)
	if !ok {
		return map[string]interface{}{"alertRule": nil}, nil
	}
	return map[string]interface{}{"alertRule": rule}, nil
}

func (r *GraphQLResolver) resolveAlertHistory(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	var ruleID *string
	if id, ok := vars["ruleId"].(string); ok && id != "" {
		ruleID = &id
	}
	limit := 100
	if l, ok := vars["limit"].(float64); ok && l > 0 {
		limit = int(l)
	}
	events := r.alertStore.ListEvents(ruleID, limit)
	return map[string]interface{}{"alertHistory": events}, nil
}

func (r *GraphQLResolver) resolveNotificationChannels(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	channels := r.alertStore.ListChannels()
	return map[string]interface{}{"notificationChannels": channels}, nil
}

func (r *GraphQLResolver) resolveSilenceRules(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	silences := r.alertStore.ListSilences()
	return map[string]interface{}{"silenceRules": silences}, nil
}

// -- Mutations --

func (r *GraphQLResolver) resolveCreateAlertRule(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	inputRaw, ok := vars["input"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid input")
	}
	
	rule := alerting.AlertRule{
		Name:            getString(inputRaw, "name"),
		Description:     getString(inputRaw, "description"),
		Query:           getString(inputRaw, "query"),
		IntervalSeconds: int(getFloat(inputRaw, "intervalSeconds")),
	}

	if c, ok := inputRaw["condition"].(map[string]interface{}); ok {
		rule.Condition = c
	}
	
	if chIDs, ok := inputRaw["notificationChannelIds"].([]interface{}); ok {
		for _, idRaw := range chIDs {
			if idStr, ok := idRaw.(string); ok {
				rule.NotificationChannelIDs = append(rule.NotificationChannelIDs, idStr)
			}
		}
	}

	created := r.alertStore.CreateRule(rule)
	return map[string]interface{}{"createAlertRule": created}, nil
}

func (r *GraphQLResolver) resolveUpdateAlertRule(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}
	inputRaw, ok := vars["input"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid input")
	}
	
	rule := alerting.AlertRule{
		Name:            getString(inputRaw, "name"),
		Description:     getString(inputRaw, "description"),
		Query:           getString(inputRaw, "query"),
		IntervalSeconds: int(getFloat(inputRaw, "intervalSeconds")),
	}

	if c, ok := inputRaw["condition"].(map[string]interface{}); ok {
		rule.Condition = c
	}
	
	if chIDs, ok := inputRaw["notificationChannelIds"].([]interface{}); ok {
		for _, idRaw := range chIDs {
			if idStr, ok := idRaw.(string); ok {
				rule.NotificationChannelIDs = append(rule.NotificationChannelIDs, idStr)
			}
		}
	}

	updated, ok := r.alertStore.UpdateRule(id, rule)
	if !ok {
		return nil, fmt.Errorf("rule not found")
	}
	return map[string]interface{}{"updateAlertRule": updated}, nil
}

func (r *GraphQLResolver) resolveDeleteAlertRule(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}
	ok := r.alertStore.DeleteRule(id)
	return map[string]interface{}{"deleteAlertRule": ok}, nil
}

func (r *GraphQLResolver) resolveCreateNotificationChannel(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	inputRaw, ok := vars["input"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid input")
	}

	ch := alerting.NotificationChannel{
		Name: getString(inputRaw, "name"),
		Type: getString(inputRaw, "type"),
	}

	if conf, ok := inputRaw["config"].(map[string]interface{}); ok {
		ch.Config = conf
	}

	created := r.alertStore.CreateChannel(ch)
	return map[string]interface{}{"createNotificationChannel": created}, nil
}

func (r *GraphQLResolver) resolveDeleteNotificationChannel(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}
	ok := r.alertStore.DeleteChannel(id)
	return map[string]interface{}{"deleteNotificationChannel": ok}, nil
}

func (r *GraphQLResolver) resolveCreateSilenceRule(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	inputRaw, ok := vars["input"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid input")
	}

	sil := alerting.SilenceRule{
		Comment: getString(inputRaw, "comment"),
	}

	if starts, ok := inputRaw["startsAt"].(string); ok {
		if t, err := time.Parse(time.RFC3339, starts); err == nil {
			sil.StartsAt = t
		}
	}
	if ends, ok := inputRaw["endsAt"].(string); ok {
		if t, err := time.Parse(time.RFC3339, ends); err == nil {
			sil.EndsAt = t
		}
	}

	if matchersRaw, ok := inputRaw["matchers"].([]interface{}); ok {
		for _, mRaw := range matchersRaw {
			if m, ok := mRaw.(map[string]interface{}); ok {
				sil.Matchers = append(sil.Matchers, alerting.Matcher{
					Key:   getString(m, "key"),
					Value: getString(m, "value"),
				})
			}
		}
	}

	created := r.alertStore.CreateSilence(sil)
	return map[string]interface{}{"createSilenceRule": created}, nil
}

func (r *GraphQLResolver) resolveDeleteSilenceRule(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	id, _ := vars["id"].(string)
	if id == "" {
		return nil, fmt.Errorf("id is required")
	}
	ok := r.alertStore.DeleteSilence(id)
	return map[string]interface{}{"deleteSilenceRule": ok}, nil
}

func (r *GraphQLResolver) resolveTestNotification(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	chID, _ := vars["channelId"].(string)
	if chID == "" {
		return nil, fmt.Errorf("channelId is required")
	}
	ch, ok := r.alertStore.GetChannel(chID)
	if !ok {
		return nil, fmt.Errorf("channel not found")
	}

	notifier := alerting.NewNotifier(r.alertStore)
	err := notifier.SendNotification(*ch, alerting.AlertRule{Name: "Test Alert", ID: "test-rule-id"}, alerting.AlertEvent{State: "ALERTING", QueryResultCount: 42})
	if err != nil {
		return nil, fmt.Errorf("test notification failed: %w", err)
	}

	return map[string]interface{}{"testNotification": true}, nil
}
