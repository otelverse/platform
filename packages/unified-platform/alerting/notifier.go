package alerting

import (
	"log"
)

type Notifier interface {
	SendNotification(channel NotificationChannel, rule AlertRule, event AlertEvent) error
}

type DefaultNotifier struct{}

func NewNotifier() *DefaultNotifier {
	return &DefaultNotifier{}
}

func (n *DefaultNotifier) SendNotification(channel NotificationChannel, rule AlertRule, event AlertEvent) error {
	log.Printf("Notifier: [Stub] Sending notification for rule %s via channel %s (State: %s)", rule.Name, channel.Type, event.State)
	return nil
}
