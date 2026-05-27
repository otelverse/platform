package alerting

import (
	"time"
)

type Condition struct {
	Type      string  `json:"type"`
	Threshold float64 `json:"threshold"`
}

type AlertRule struct {
	ID                     string                 `json:"id"`
	Name                   string                 `json:"name"`
	Description            string                 `json:"description"`
	Query                  string                 `json:"query"`
	Condition              map[string]interface{} `json:"condition"`
	IntervalSeconds        int                    `json:"intervalSeconds"`
	NotificationChannelIDs []string               `json:"notificationChannelIds"`
	State                  string                 `json:"state"`
	LastEvaluatedAt        *time.Time             `json:"lastEvaluatedAt"`
}

type NotificationChannel struct {
	ID     string                 `json:"id"`
	Name   string                 `json:"name"`
	Type   string                 `json:"type"`
	Config map[string]interface{} `json:"config"`
}

type Matcher struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type SilenceRule struct {
	ID       string                 `json:"id"`
	Matchers []Matcher              `json:"matchers"`
	StartsAt time.Time              `json:"startsAt"`
	EndsAt   time.Time              `json:"endsAt"`
	Comment  string                 `json:"comment"`
}

type AlertEvent struct {
	ID               string    `json:"id"`
	AlertRuleID      string    `json:"alertRuleId"`
	Timestamp        time.Time `json:"timestamp"`
	State            string    `json:"state"`
	QueryResultCount int       `json:"queryResultCount"`
	NotificationSent bool      `json:"notificationSent"`
}
