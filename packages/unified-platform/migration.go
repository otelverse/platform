package main

import (
	"database/sql"
	"embed"
	"fmt"
	"log"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/ClickHouse/clickhouse-go/v2"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

func RunMigrations(dsn string) error {
	db, err := sql.Open("clickhouse", dsn)
	if err != nil {
		return fmt.Errorf("failed to open clickhouse connection: %w", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		return fmt.Errorf("failed to ping clickhouse: %w", err)
	}

	entries, err := migrationsFS.ReadDir("migrations")
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
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
			return fmt.Errorf("failed to read %s: %w", f, err)
		}

		sqlStr := string(content)
		if strings.TrimSpace(sqlStr) == "" {
			continue
		}

		log.Printf("Running migration: %s", f)
		if _, err := db.Exec(sqlStr); err != nil {
			return fmt.Errorf("failed to execute %s: %w", f, err)
		}
	}

	log.Println("Migrations completed successfully")
	return nil
}
