package uql

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// ExecuteQuery parses, translates, and executes a UQL query, returning the number of matching results.
// For alerting, we primarily care about the result count to evaluate conditions like COUNT_GT.
func ExecuteQueryCount(ctx context.Context, db *sql.DB, queryStr string) (int, error) {
	parser := NewParser(queryStr)
	query, err := parser.Parse()
	if err != nil {
		return 0, fmt.Errorf("parse error: %w", err)
	}

	sqlQuery, args, err := query.ToClickhouse()
	if err != nil {
		return 0, fmt.Errorf("translation error: %w", err)
	}

	// Wrap the query to just get the count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM (%s)", sqlQuery)
	var count int
	maxRetries := 3
	for attempt := 0; attempt < maxRetries; attempt++ {
		err = db.QueryRowContext(ctx, countQuery, args...).Scan(&count)
		if err == nil {
			return count, nil
		}
		if attempt < maxRetries-1 {
			// Backoff before retry
			select {
			case <-ctx.Done():
				return 0, ctx.Err()
			case <-time.After(time.Duration(500*(attempt+1)) * time.Millisecond):
			}
		}
	}
	
	if err != nil {
		return 0, fmt.Errorf("execution error after %d retries: %w", maxRetries, err)
	}

	return count, nil
}
