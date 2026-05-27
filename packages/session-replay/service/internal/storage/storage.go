package storage

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"time"

	_ "github.com/lib/pq"
)

type Session struct {
	SessionID string    `json:"sessionId"`
	StartTime time.Time `json:"startTime"`
	EndTime   time.Time `json:"endTime"`
}

type EventPayload struct {
	SessionID string          `json:"sessionId"`
	Events    json.RawMessage `json:"events"`
	Timestamp int64           `json:"timestamp"`
	Href      string          `json:"href"`
}

type Storage struct {
	db      *sql.DB
	dataDir string
}

func NewStorage(dbDSN, dataDir string) (*Storage, error) {
	if dataDir == "" {
		dataDir = "/tmp/otelverse_replays"
	}
	os.MkdirAll(dataDir, 0755)

	var db *sql.DB
	var err error
	if dbDSN != "" {
		db, err = sql.Open("postgres", dbDSN)
		if err != nil {
			return nil, err
		}
		// Create table if not exists
		_, err = db.Exec(`
			CREATE TABLE IF NOT EXISTS sessions (
				session_id VARCHAR(255) PRIMARY KEY,
				start_time TIMESTAMP,
				end_time TIMESTAMP
			)
		`)
		if err != nil {
			return nil, err
		}
	}

	return &Storage{db: db, dataDir: dataDir}, nil
}

func (s *Storage) SaveEvents(payload EventPayload) error {
	sessionDir := filepath.Join(s.dataDir, payload.SessionID)
	os.MkdirAll(sessionDir, 0755)

	filename := filepath.Join(sessionDir, fmt.Sprintf("%d.json", payload.Timestamp))
	if err := ioutil.WriteFile(filename, payload.Events, 0644); err != nil {
		return err
	}

	if s.db != nil {
		// UPSERT session
		t := time.UnixMilli(payload.Timestamp)
		_, err := s.db.Exec(`
			INSERT INTO sessions (session_id, start_time, end_time) 
			VALUES ($1, $2, $2)
			ON CONFLICT (session_id) DO UPDATE SET 
			end_time = GREATEST(sessions.end_time, EXCLUDED.end_time),
			start_time = LEAST(sessions.start_time, EXCLUDED.start_time)
		`, payload.SessionID, t)
		if err != nil {
			return err
		}
	}

	return nil
}

func (s *Storage) GetEvents(sessionID string) ([]json.RawMessage, error) {
	sessionDir := filepath.Join(s.dataDir, sessionID)
	files, err := ioutil.ReadDir(sessionDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []json.RawMessage{}, nil
		}
		return nil, err
	}

	var allEvents []json.RawMessage
	for _, f := range files {
		if f.IsDir() || filepath.Ext(f.Name()) != ".json" {
			continue
		}
		data, err := ioutil.ReadFile(filepath.Join(sessionDir, f.Name()))
		if err != nil {
			continue
		}
		var chunk []json.RawMessage
		if err := json.Unmarshal(data, &chunk); err == nil {
			allEvents = append(allEvents, chunk...)
		}
	}
	return allEvents, nil
}

func (s *Storage) ListSessions(limit int) ([]Session, error) {
	if s.db == nil {
		return nil, fmt.Errorf("database not configured")
	}

	rows, err := s.db.Query(`SELECT session_id, start_time, end_time FROM sessions ORDER BY end_time DESC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []Session
	for rows.Next() {
		var sess Session
		if err := rows.Scan(&sess.SessionID, &sess.StartTime, &sess.EndTime); err != nil {
			return nil, err
		}
		sessions = append(sessions, sess)
	}
	return sessions, nil
}
