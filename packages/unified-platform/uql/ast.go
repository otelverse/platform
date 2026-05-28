package uql

// AggregationNode represents a UQL aggregation operation like `by span.name | count`.
type AggregationNode struct {
	GroupByField string               `json:"groupByField,omitempty"`
	Functions    []AggregationFunction `json:"functions"`
}

// AggregationFunction represents an individual function call like `count` or `avg(duration)`.
type AggregationFunction struct {
	Name  string `json:"name"`  // e.g., "count", "avg", "p95"
	Field string `json:"field"` // e.g., "duration", empty for "count"
}

// JoinNode represents a cross-signal join operation like `join logs on traceId`.
type JoinNode struct {
	TargetSignal QueryType `json:"targetSignal"`
	OnField      string    `json:"onField"`
}
