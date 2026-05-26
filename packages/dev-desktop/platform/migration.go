package main

import (
	"database/sql"
	"embed"
	"log"
	"path/filepath"
	"sort"
	"strings"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

func RunMigrations(db *sql.DB) error {
	entries, err := migrationsFS.ReadDir("migrations")
	if err != nil {
		return err
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".sql") {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)

	for _, f := range files {
		content, err := migrationsFS.ReadFile(filepath.Join("migrations", f))
		if err != nil {
			return err
		}
		sqlStr := string(content)
		if strings.TrimSpace(sqlStr) == "" {
			continue
		}
		log.Printf("Running migration: %s", f)
		if _, err := db.Exec(sqlStr); err != nil {
			return err
		}
	}

	log.Println("Migrations completed successfully")
	return nil
}
