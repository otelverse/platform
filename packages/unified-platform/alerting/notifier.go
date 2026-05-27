package alerting

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"time"
)

type Notifier interface {
	SendNotification(channel NotificationChannel, rule AlertRule, event AlertEvent) error
}

type DefaultNotifier struct {
	store *Store
}

func NewNotifier(store *Store) *DefaultNotifier {
	return &DefaultNotifier{store: store}
}

func (n *DefaultNotifier) isSilenced(rule AlertRule, event AlertEvent) bool {
	now := time.Now()
	silences := n.store.ListSilences()
	
	// Flatten rule context into a map of matchers
	ruleAttrs := map[string]string{
		"alertname": rule.Name,
		"rule_id":   rule.ID,
		"state":     event.State,
	}

	for _, sil := range silences {
		// Check if active
		if now.Before(sil.StartsAt) || now.After(sil.EndsAt) {
			continue
		}

		// Check matchers
		matchesAll := true
		for _, m := range sil.Matchers {
			val, ok := ruleAttrs[m.Key]
			if !ok || val != m.Value {
				matchesAll = false
				break
			}
		}

		if matchesAll && len(sil.Matchers) > 0 {
			log.Printf("Notifier: Alert %s silenced by rule %s", rule.Name, sil.ID)
			return true
		}
	}
	return false
}

func (n *DefaultNotifier) SendNotification(channel NotificationChannel, rule AlertRule, event AlertEvent) error {
	if n.isSilenced(rule, event) {
		return nil
	}

	msg := fmt.Sprintf("Alert: %s is now %s (Count: %d)", rule.Name, event.State, event.QueryResultCount)

	switch channel.Type {
	case "SLACK":
		return n.sendSlack(channel.Config, msg)
	case "WEBHOOK":
		return n.sendWebhook(channel.Config, msg)
	case "EMAIL":
		return n.sendEmail(channel.Config, msg, rule.Name, event.State)
	default:
		log.Printf("Notifier: Unknown channel type %s", channel.Type)
		return nil
	}
}

func (n *DefaultNotifier) sendSlack(config map[string]interface{}, msg string) error {
	webhookURL, ok := config["webhookUrl"].(string)
	if !ok || webhookURL == "" {
		return fmt.Errorf("missing webhookUrl for SLACK")
	}

	payload := map[string]string{"text": msg}
	body, _ := json.Marshal(payload)
	
	resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode >= 400 {
		return fmt.Errorf("slack webhook failed with status %d", resp.StatusCode)
	}
	return nil
}

func (n *DefaultNotifier) sendWebhook(config map[string]interface{}, msg string) error {
	url, ok := config["url"].(string)
	if !ok || url == "" {
		return fmt.Errorf("missing url for WEBHOOK")
	}

	payload := map[string]string{"message": msg}
	body, _ := json.Marshal(payload)
	
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode >= 400 {
		return fmt.Errorf("webhook failed with status %d", resp.StatusCode)
	}
	return nil
}

func (n *DefaultNotifier) sendEmail(config map[string]interface{}, msg, ruleName, state string) error {
	to, ok := config["to"].(string)
	if !ok || to == "" {
		return fmt.Errorf("missing 'to' address for EMAIL")
	}
	
	smtpHost, _ := config["smtpHost"].(string)
	smtpPort, _ := config["smtpPort"].(string)
	
	if smtpHost == "" || smtpPort == "" {
		// Mock email sending if no SMTP configured for testing purposes
		log.Printf("Notifier: Mock sending email to %s: %s", to, msg)
		return nil
	}

	auth := smtp.PlainAuth("", config["username"].(string), config["password"].(string), smtpHost)
	from := "alerts@otelverse.local"
	
	subject := fmt.Sprintf("Subject: [OTelVerse Alert] %s - %s\r\n\r\n", state, ruleName)
	body := []byte(subject + msg)
	
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, body)
}
