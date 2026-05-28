package alerting

import (
	"context"
	"database/sql"
	"log"
	"time"

	"github.com/otelverse/unified-platform/uql"
)

type UQLExecutor interface {
	ExecuteQueryCount(ctx context.Context, queryStr string) (int, error)
}

type defaultUQLExecutor struct {
	db *sql.DB
}

func (d *defaultUQLExecutor) ExecuteQueryCount(ctx context.Context, queryStr string) (int, error) {
	return uql.ExecuteQueryCount(ctx, d.db, queryStr)
}

type Evaluator struct {
	store    *Store
	executor UQLExecutor
	notifier Notifier
}

func NewEvaluator(store *Store, db *sql.DB, notifier Notifier) *Evaluator {
	return &Evaluator{
		store:    store,
		executor: &defaultUQLExecutor{db: db},
		notifier: notifier,
	}
}

func (e *Evaluator) Start(ctx context.Context) {
	ticker := time.NewTicker(10 * time.Second)
	go func() {
		for {
			select {
			case <-ctx.Done():
				ticker.Stop()
				return
			case <-ticker.C:
				e.EvaluateAll(ctx)
			}
		}
	}()
}

func (e *Evaluator) EvaluateAll(ctx context.Context) {
	rules := e.store.ListRules()
	now := time.Now()

	for _, rule := range rules {
		if rule.LastEvaluatedAt != nil {
			nextEvalTime := rule.LastEvaluatedAt.Add(time.Duration(rule.IntervalSeconds) * time.Second)
			if now.Before(nextEvalTime) {
				continue
			}
		}

		// Evaluate
		count, err := e.executor.ExecuteQueryCount(ctx, rule.Query)
		if err != nil {
			log.Printf("Evaluator: failed to execute query for rule %s: %v", rule.ID, err)
			continue
		}

		conditionMet := e.checkCondition(count, rule.Condition)
		
		var newState string
		if conditionMet {
			newState = "ALERTING"
		} else {
			newState = "OK"
		}

		// State transition
		if newState != rule.State {
			event := AlertEvent{
				AlertRuleID:      rule.ID,
				Timestamp:        now,
				State:            newState,
				QueryResultCount: count,
			}
			
			// Notify
			for _, chID := range rule.NotificationChannelIDs {
				if ch, ok := e.store.GetChannel(chID); ok {
					err := e.notifier.SendNotification(*ch, *rule, event)
					if err == nil {
						event.NotificationSent = true
					}
				}
			}

			e.store.AddEvent(event)
			
			// Update rule state
			rule.State = newState
		}

		// Always update last evaluated time
		t := now
		rule.LastEvaluatedAt = &t
		e.store.UpdateRule(rule.ID, *rule)
	}
}

func (e *Evaluator) checkCondition(count int, condition map[string]interface{}) bool {
	condType, _ := condition["type"].(string)
	threshold, _ := condition["threshold"].(float64)

	switch condType {
	case "COUNT_GT":
		return float64(count) > threshold
	case "COUNT_LT":
		return float64(count) < threshold
	case "COUNT_EQ":
		return float64(count) == threshold
	case "ANY_RESULT":
		return count > 0
	default:
		return false
	}
}
