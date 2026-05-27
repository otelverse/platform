package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})
	fmt.Println("Chaos Engine Control Plane starting on :8083")
	http.ListenAndServe(":8083", nil)
}
