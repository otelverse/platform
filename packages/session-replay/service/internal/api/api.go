package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/otelverse/session-replay-service/internal/storage"
)

type API struct {
	store *storage.Storage
}

func NewAPI(store *storage.Storage) *API {
	return &API{store: store}
}

func (a *API) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/api/v1/replay/upload", a.handleUpload).Methods("POST")
	r.HandleFunc("/api/v1/replay/sessions", a.handleListSessions).Methods("GET")
	r.HandleFunc("/api/v1/replay/{sessionId}", a.handleGetEvents).Methods("GET")
}

func (a *API) handleUpload(w http.ResponseWriter, r *http.Request) {
	var payload storage.EventPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if payload.SessionID == "" {
		http.Error(w, "sessionId is required", http.StatusBadRequest)
		return
	}

	if err := a.store.SaveEvents(payload); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (a *API) handleListSessions(w http.ResponseWriter, r *http.Request) {
	sessions, err := a.store.ListSessions(20)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(sessions)
}

func (a *API) handleGetEvents(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID := vars["sessionId"]

	events, err := a.store.GetEvents(sessionID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(events)
}
