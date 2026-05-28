package alerting

import (
	"database/sql"
	"encoding/json"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

type Store struct {
	db       *sql.DB
	mu       sync.RWMutex
	rules    map[string]*AlertRule
	channels map[string]*NotificationChannel
	silences map[string]*SilenceRule
	events   []*AlertEvent
}

func NewStore(db *sql.DB) *Store {
	return &Store{
		db:       db,
		rules:    make(map[string]*AlertRule),
		channels: make(map[string]*NotificationChannel),
		silences: make(map[string]*SilenceRule),
		events:   make([]*AlertEvent, 0),
	}
}

// --- Rules ---

func (s *Store) CreateRule(rule AlertRule) *AlertRule {
	rule.ID = uuid.NewString()
	if rule.State == "" {
		rule.State = "OK"
	}
	
	if s.db != nil {
		condJSON, _ := json.Marshal(rule.Condition)
		channelIDs := "{" + strings.Join(rule.NotificationChannelIDs, ",") + "}"
		_, err := s.db.Exec(`
			INSERT INTO alert_rules (id, name, description, query, condition, interval_seconds, notification_channel_ids, state)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			rule.ID, rule.Name, rule.Description, rule.Query, condJSON, rule.IntervalSeconds, channelIDs, rule.State)
		if err != nil {
			log.Printf("CreateRule db error: %v", err)
		}
		return &rule
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	r := rule
	s.rules[r.ID] = &r
	return &r
}

func (s *Store) UpdateRule(id string, input AlertRule) (*AlertRule, bool) {
	input.ID = id
	if input.State == "" {
		input.State = "OK"
	}

	if s.db != nil {
		condJSON, _ := json.Marshal(input.Condition)
		channelIDs := "{" + strings.Join(input.NotificationChannelIDs, ",") + "}"
		res, err := s.db.Exec(`
			UPDATE alert_rules SET name=$1, description=$2, query=$3, condition=$4, interval_seconds=$5, notification_channel_ids=$6, state=$7
			WHERE id=$8`,
			input.Name, input.Description, input.Query, condJSON, input.IntervalSeconds, channelIDs, input.State, id)
		if err != nil {
			log.Printf("UpdateRule db error: %v", err)
			return nil, false
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			return nil, false
		}
		return &input, true
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.rules[id]; !ok {
		return nil, false
	}
	r := input
	s.rules[id] = &r
	return &r, true
}

func (s *Store) DeleteRule(id string) bool {
	if s.db != nil {
		res, err := s.db.Exec(`DELETE FROM alert_rules WHERE id=$1`, id)
		if err != nil {
			log.Printf("DeleteRule db error: %v", err)
			return false
		}
		rowsAffected, _ := res.RowsAffected()
		return rowsAffected > 0
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.rules[id]; ok {
		delete(s.rules, id)
		return true
	}
	return false
}

func (s *Store) GetRule(id string) (*AlertRule, bool) {
	if s.db != nil {
		var r AlertRule
		var condJSON []byte
		var channelIDs string
		var lastEval sql.NullTime
		var desc sql.NullString
		err := s.db.QueryRow(`
			SELECT id, name, description, query, condition, interval_seconds, notification_channel_ids, state, last_evaluated_at
			FROM alert_rules WHERE id=$1`, id).Scan(
			&r.ID, &r.Name, &desc, &r.Query, &condJSON, &r.IntervalSeconds, &channelIDs, &r.State, &lastEval)
		if err != nil {
			if err != sql.ErrNoRows {
				log.Printf("GetRule db error: %v", err)
			}
			return nil, false
		}
		if desc.Valid {
			r.Description = desc.String
		}
		if lastEval.Valid {
			t := lastEval.Time
			r.LastEvaluatedAt = &t
		}
		json.Unmarshal(condJSON, &r.Condition)
		channelIDs = strings.Trim(channelIDs, "{}")
		if channelIDs != "" {
			r.NotificationChannelIDs = strings.Split(channelIDs, ",")
		}
		return &r, true
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	if r, ok := s.rules[id]; ok {
		return r, true
	}
	return nil, false
}

func (s *Store) ListRules() []*AlertRule {
	if s.db != nil {
		rows, err := s.db.Query(`SELECT id, name, description, query, condition, interval_seconds, notification_channel_ids, state, last_evaluated_at FROM alert_rules`)
		if err != nil {
			log.Printf("ListRules db error: %v", err)
			return nil
		}
		defer rows.Close()
		var res []*AlertRule
		for rows.Next() {
			var r AlertRule
			var condJSON []byte
			var channelIDs string
			var lastEval sql.NullTime
			var desc sql.NullString
			if err := rows.Scan(&r.ID, &r.Name, &desc, &r.Query, &condJSON, &r.IntervalSeconds, &channelIDs, &r.State, &lastEval); err != nil {
				continue
			}
			if desc.Valid {
				r.Description = desc.String
			}
			if lastEval.Valid {
				t := lastEval.Time
				r.LastEvaluatedAt = &t
			}
			json.Unmarshal(condJSON, &r.Condition)
			channelIDs = strings.Trim(channelIDs, "{}")
			if channelIDs != "" {
				r.NotificationChannelIDs = strings.Split(channelIDs, ",")
			}
			res = append(res, &r)
		}
		return res
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*AlertRule
	for _, r := range s.rules {
		res = append(res, r)
	}
	return res
}

// --- Channels ---

func (s *Store) CreateChannel(ch NotificationChannel) *NotificationChannel {
	ch.ID = uuid.NewString()
	
	if s.db != nil {
		configJSON, _ := json.Marshal(ch.Config)
		_, err := s.db.Exec(`
			INSERT INTO notification_channels (id, name, type, config)
			VALUES ($1, $2, $3, $4)`,
			ch.ID, ch.Name, ch.Type, configJSON)
		if err != nil {
			log.Printf("CreateChannel db error: %v", err)
		}
		return &ch
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	c := ch
	s.channels[c.ID] = &c
	return &c
}

func (s *Store) DeleteChannel(id string) bool {
	if s.db != nil {
		res, err := s.db.Exec(`DELETE FROM notification_channels WHERE id=$1`, id)
		if err != nil {
			log.Printf("DeleteChannel db error: %v", err)
			return false
		}
		rowsAffected, _ := res.RowsAffected()
		return rowsAffected > 0
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.channels[id]; ok {
		delete(s.channels, id)
		return true
	}
	return false
}

func (s *Store) ListChannels() []*NotificationChannel {
	if s.db != nil {
		rows, err := s.db.Query(`SELECT id, name, type, config FROM notification_channels`)
		if err != nil {
			log.Printf("ListChannels db error: %v", err)
			return nil
		}
		defer rows.Close()
		var res []*NotificationChannel
		for rows.Next() {
			var ch NotificationChannel
			var configJSON []byte
			if err := rows.Scan(&ch.ID, &ch.Name, &ch.Type, &configJSON); err != nil {
				continue
			}
			json.Unmarshal(configJSON, &ch.Config)
			res = append(res, &ch)
		}
		return res
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*NotificationChannel
	for _, c := range s.channels {
		res = append(res, c)
	}
	return res
}

func (s *Store) GetChannel(id string) (*NotificationChannel, bool) {
	if s.db != nil {
		var ch NotificationChannel
		var configJSON []byte
		err := s.db.QueryRow(`SELECT id, name, type, config FROM notification_channels WHERE id=$1`, id).Scan(
			&ch.ID, &ch.Name, &ch.Type, &configJSON)
		if err != nil {
			return nil, false
		}
		json.Unmarshal(configJSON, &ch.Config)
		return &ch, true
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	if c, ok := s.channels[id]; ok {
		return c, true
	}
	return nil, false
}

// --- Silences ---

func (s *Store) CreateSilence(sil SilenceRule) *SilenceRule {
	sil.ID = uuid.NewString()

	if s.db != nil {
		matchersJSON, _ := json.Marshal(sil.Matchers)
		startsAt := sil.StartsAt
		endsAt := sil.EndsAt
		_, err := s.db.Exec(`
			INSERT INTO silence_rules (id, matchers, starts_at, ends_at, comment)
			VALUES ($1, $2, $3, $4, $5)`,
			sil.ID, matchersJSON, startsAt, endsAt, sil.Comment)
		if err != nil {
			log.Printf("CreateSilence db error: %v", err)
		}
		return &sil
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	sr := sil
	s.silences[sr.ID] = &sr
	return &sr
}

func (s *Store) DeleteSilence(id string) bool {
	if s.db != nil {
		res, err := s.db.Exec(`DELETE FROM silence_rules WHERE id=$1`, id)
		if err != nil {
			log.Printf("DeleteSilence db error: %v", err)
			return false
		}
		rowsAffected, _ := res.RowsAffected()
		return rowsAffected > 0
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.silences[id]; ok {
		delete(s.silences, id)
		return true
	}
	return false
}

func (s *Store) ListSilences() []*SilenceRule {
	if s.db != nil {
		rows, err := s.db.Query(`SELECT id, matchers, starts_at, ends_at, comment FROM silence_rules`)
		if err != nil {
			log.Printf("ListSilences db error: %v", err)
			return nil
		}
		defer rows.Close()
		var res []*SilenceRule
		for rows.Next() {
			var sil SilenceRule
			var matchersJSON []byte
			var startsAt, endsAt time.Time
			var comment sql.NullString
			if err := rows.Scan(&sil.ID, &matchersJSON, &startsAt, &endsAt, &comment); err != nil {
				continue
			}
			json.Unmarshal(matchersJSON, &sil.Matchers)
			sil.StartsAt = startsAt
			sil.EndsAt = endsAt
			if comment.Valid {
				sil.Comment = comment.String
			}
			res = append(res, &sil)
		}
		return res
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*SilenceRule
	for _, sr := range s.silences {
		res = append(res, sr)
	}
	return res
}

// --- Events ---

func (s *Store) AddEvent(event AlertEvent) *AlertEvent {
	event.ID = uuid.NewString()
	
	if s.db != nil {
		ts := event.Timestamp
		if ts.IsZero() {
			ts = time.Now()
		}
		_, err := s.db.Exec(`
			INSERT INTO alert_events (id, alert_rule_id, timestamp, state, query_result_count, notification_sent)
			VALUES ($1, $2, $3, $4, $5, $6)`,
			event.ID, event.AlertRuleID, ts, event.State, event.QueryResultCount, event.NotificationSent)
		if err != nil {
			log.Printf("AddEvent db error: %v", err)
		}
		return &event
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	e := event
	s.events = append(s.events, &e)
	return &e
}

func (s *Store) ListEvents(ruleID *string, limit int) []*AlertEvent {
	if s.db != nil {
		var rows *sql.Rows
		var err error
		if ruleID != nil {
			rows, err = s.db.Query(`
				SELECT id, alert_rule_id, timestamp, state, query_result_count, notification_sent
				FROM alert_events WHERE alert_rule_id=$1 ORDER BY timestamp DESC LIMIT $2`, *ruleID, limit)
		} else {
			rows, err = s.db.Query(`
				SELECT id, alert_rule_id, timestamp, state, query_result_count, notification_sent
				FROM alert_events ORDER BY timestamp DESC LIMIT $1`, limit)
		}
		if err != nil {
			log.Printf("ListEvents db error: %v", err)
			return nil
		}
		defer rows.Close()
		var res []*AlertEvent
		for rows.Next() {
			var e AlertEvent
			var ts time.Time
			var qc sql.NullInt64
			if err := rows.Scan(&e.ID, &e.AlertRuleID, &ts, &e.State, &qc, &e.NotificationSent); err != nil {
				continue
			}
			e.Timestamp = ts
			if qc.Valid {
				e.QueryResultCount = int(qc.Int64)
			}
			res = append(res, &e)
		}
		return res
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*AlertEvent
	for i := len(s.events) - 1; i >= 0; i-- {
		e := s.events[i]
		if ruleID != nil && e.AlertRuleID != *ruleID {
			continue
		}
		res = append(res, e)
		if len(res) == limit {
			break
		}
	}
	return res
}

