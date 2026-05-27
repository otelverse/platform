package alerting

import (
	"sync"

	"github.com/google/uuid"
)

type Store struct {
	mu                   sync.RWMutex
	rules                map[string]*AlertRule
	channels             map[string]*NotificationChannel
	silences             map[string]*SilenceRule
	events               []*AlertEvent
}

func NewStore() *Store {
	return &Store{
		rules:    make(map[string]*AlertRule),
		channels: make(map[string]*NotificationChannel),
		silences: make(map[string]*SilenceRule),
		events:   make([]*AlertEvent, 0),
	}
}

// --- Rules ---

func (s *Store) CreateRule(rule AlertRule) *AlertRule {
	s.mu.Lock()
	defer s.mu.Unlock()
	rule.ID = uuid.NewString()
	if rule.State == "" {
		rule.State = "OK"
	}
	// Store a copy
	r := rule
	s.rules[r.ID] = &r
	return &r
}

func (s *Store) UpdateRule(id string, input AlertRule) (*AlertRule, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.rules[id]; !ok {
		return nil, false
	}
	input.ID = id
	if input.State == "" {
		input.State = "OK" // Reset state on update
	}
	r := input
	s.rules[id] = &r
	return &r, true
}

func (s *Store) DeleteRule(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.rules[id]; ok {
		delete(s.rules, id)
		return true
	}
	return false
}

func (s *Store) GetRule(id string) (*AlertRule, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if r, ok := s.rules[id]; ok {
		return r, true
	}
	return nil, false
}

func (s *Store) ListRules() []*AlertRule {
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
	s.mu.Lock()
	defer s.mu.Unlock()
	ch.ID = uuid.NewString()
	c := ch
	s.channels[c.ID] = &c
	return &c
}

func (s *Store) DeleteChannel(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.channels[id]; ok {
		delete(s.channels, id)
		return true
	}
	return false
}

func (s *Store) ListChannels() []*NotificationChannel {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var res []*NotificationChannel
	for _, c := range s.channels {
		res = append(res, c)
	}
	return res
}

func (s *Store) GetChannel(id string) (*NotificationChannel, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if c, ok := s.channels[id]; ok {
		return c, true
	}
	return nil, false
}

// --- Silences ---

func (s *Store) CreateSilence(sil SilenceRule) *SilenceRule {
	s.mu.Lock()
	defer s.mu.Unlock()
	sil.ID = uuid.NewString()
	sr := sil
	s.silences[sr.ID] = &sr
	return &sr
}

func (s *Store) DeleteSilence(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.silences[id]; ok {
		delete(s.silences, id)
		return true
	}
	return false
}

func (s *Store) ListSilences() []*SilenceRule {
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
	s.mu.Lock()
	defer s.mu.Unlock()
	event.ID = uuid.NewString()
	e := event
	s.events = append(s.events, &e)
	return &e
}

func (s *Store) ListEvents(ruleID *string, limit int) []*AlertEvent {
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
