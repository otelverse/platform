package optimizer

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"

	"github.com/otelverse/unified-platform/pipeline"
)

type TelemetryStats struct {
	TotalSpans      int            `json:"totalSpans"`
	SpansPerService []ServiceSpans `json:"spansPerService"`
	ErrorRate       float64        `json:"errorRate"`
	AverageLatency  float64        `json:"averageLatency"`
}

type ServiceSpans struct {
	ServiceName     string  `json:"serviceName"`
	SpanCount       int     `json:"spanCount"`
	ErrorCount      int     `json:"errorCount"`
	AverageDuration float64 `json:"averageDuration"` // in nanoseconds
}

type OptimizationRecommendation struct {
	ID               string                 `json:"id"`
	Type             string                 `json:"type"`
	Description      string                 `json:"description"`
	AffectedServices []string               `json:"affectedServices"`
	ProposedConfig   map[string]interface{} `json:"proposedConfig"`
	PotentialSavings float64                `json:"potentialSavings"`
	Confidence       float64                `json:"confidence"`
}

const (
	TypeTailSampling          = "TAIL_SAMPLING"
	TypePIIRedaction          = "PII_REDACTION"
	TypeProbabilisticSampling = "PROBABILISTIC_SAMPLING"
)

// AnalyzeTraces runs heuristics on telemetry stats and raw db queries to find optimizations.
func AnalyzeTraces(ctx context.Context, db *sql.DB, stats TelemetryStats, startTime, endTime string) ([]OptimizationRecommendation, error) {
	var recs []OptimizationRecommendation

	// 1. Tail sampling for errors & 2. Latency-based sampling & 3. Low-value downsampling
	for _, svc := range stats.SpansPerService {
		if svc.SpanCount == 0 {
			continue
		}

		svcErrorRate := float64(svc.ErrorCount) / float64(svc.SpanCount)
		avgMs := svc.AverageDuration / 1e6

		if svcErrorRate > 0.05 {
			recs = append(recs, OptimizationRecommendation{
				ID:               fmt.Sprintf("tail-sampling-%s", svc.ServiceName),
				Type:             TypeTailSampling,
				Description:      fmt.Sprintf("High error rate (%.1f%%) in %s. Use tail sampling to keep all errors but downsample successes.", svcErrorRate*100, svc.ServiceName),
				AffectedServices: []string{svc.ServiceName},
				ProposedConfig: map[string]interface{}{
					"policies": []map[string]interface{}{
						{
							"name": "keep_errors",
							"type": "status_code",
							"status_code": map[string]interface{}{
								"status_codes": []string{"ERROR"},
							},
						},
						{
							"name": "probabilistic_ok",
							"type": "probabilistic",
							"probabilistic": map[string]interface{}{
								"sampling_percentage": 10,
							},
						},
					},
				},
				PotentialSavings: 80.0,
				Confidence:       0.9,
			})
		} else if avgMs > 500 {
			recs = append(recs, OptimizationRecommendation{
				ID:               fmt.Sprintf("latency-sampling-%s", svc.ServiceName),
				Type:             TypeTailSampling,
				Description:      fmt.Sprintf("High average latency (%.0fms) in %s. Retain high-latency traces for performance tuning.", avgMs, svc.ServiceName),
				AffectedServices: []string{svc.ServiceName},
				ProposedConfig: map[string]interface{}{
					"policies": []map[string]interface{}{
						{
							"name": "keep_slow",
							"type": "latency",
							"latency": map[string]interface{}{
								"threshold_ms": 500,
							},
						},
					},
				},
				PotentialSavings: 60.0,
				Confidence:       0.8,
			})
		} else if svc.SpanCount > 1000 && svcErrorRate < 0.01 && avgMs < 100 {
			recs = append(recs, OptimizationRecommendation{
				ID:               fmt.Sprintf("probabilistic-%s", svc.ServiceName),
				Type:             TypeProbabilisticSampling,
				Description:      fmt.Sprintf("High volume, low error/latency in %s. Safe to aggressively downsample.", svc.ServiceName),
				AffectedServices: []string{svc.ServiceName},
				ProposedConfig: map[string]interface{}{
					"hash_seed": 22,
					"sampling_percentage": 10,
				},
				PotentialSavings: 90.0,
				Confidence:       0.95,
			})
		}
	}

	if db != nil {
		piiFound, affected, err := detectPII(ctx, db, startTime, endTime)
		if err != nil {
			return nil, fmt.Errorf("pii detection failed: %w", err)
		}

		if piiFound {
			recs = append(recs, OptimizationRecommendation{
				ID:               "pii-redaction",
				Type:             TypePIIRedaction,
				Description:      "Detected potential PII (emails/SSNs) in trace attributes. Apply redaction processor.",
				AffectedServices: affected,
				ProposedConfig: map[string]interface{}{
					"action": "hash",
					"hash_values": []string{
						"email",
						"ssn",
						"credit_card",
					},
				},
				PotentialSavings: 0.0,
				Confidence:       0.99,
			})
		}
	}

	return recs, nil
}

// detectPII samples recent spans and uses regex to check attribute contents for PII
func detectPII(ctx context.Context, db *sql.DB, startTime, endTime string) (bool, []string, error) {
	rows, err := db.QueryContext(ctx, `
		SELECT ServiceName, Attributes, ResourceAttributes
		FROM otel_traces
		WHERE StartTime >= ? AND StartTime <= ?
		LIMIT 1000
	`, startTime, endTime)
	if err != nil {
		return false, nil, err
	}
	defer rows.Close()

	emailRegex := regexp.MustCompile(`(?i)\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b`)
	ssnRegex := regexp.MustCompile(`\b\d{3}-\d{2}-\d{4}\b`)

	affected := make(map[string]bool)
	found := false

	for rows.Next() {
		var svcName string
		var attrs, resAttrs *string
		if err := rows.Scan(&svcName, &attrs, &resAttrs); err != nil {
			continue
		}

		checkPII := func(jsonStr *string) bool {
			if jsonStr == nil || *jsonStr == "" {
				return false
			}
			if emailRegex.MatchString(*jsonStr) || ssnRegex.MatchString(*jsonStr) {
				return true
			}
			return false
		}

		if checkPII(attrs) || checkPII(resAttrs) {
			affected[svcName] = true
			found = true
		}
	}

	affectedList := make([]string, 0, len(affected))
	for k := range affected {
		affectedList = append(affectedList, k)
	}

	return found, affectedList, nil
}

func ApplyRecommendation(p *pipeline.Pipeline, rec OptimizationRecommendation) error {
	switch rec.Type {
	case TypeTailSampling:
		// Insert a tail_sampling processor node
		p.Nodes = append(p.Nodes, pipeline.PipelineNode{
			ID:         fmt.Sprintf("tail-sampling-%d", len(p.Nodes)),
			Type:       pipeline.NodeTypeProcessorTailSampling,
			Label:      "Tail Sampling",
			Properties: rec.ProposedConfig,
			Position: pipeline.Position{
				X: 400,
				Y: 300,
			},
		})
		// Edge logic is tricky, UI will handle actual connection or we can just drop the node in for the user to wire up.
		// For MVP, we just add the node to the graph and let the UI user wire it. 
	case TypePIIRedaction:
		p.Nodes = append(p.Nodes, pipeline.PipelineNode{
			ID:         fmt.Sprintf("pii-redaction-%d", len(p.Nodes)),
			Type:       pipeline.NodeType("PROCESSOR_ATTRIBUTES"), // Or similar
			Label:      "PII Redaction",
			Properties: rec.ProposedConfig,
			Position: pipeline.Position{
				X: 400,
				Y: 400,
			},
		})
	case TypeProbabilisticSampling:
		p.Nodes = append(p.Nodes, pipeline.PipelineNode{
			ID:         fmt.Sprintf("probabilistic-%d", len(p.Nodes)),
			Type:       pipeline.NodeType("PROCESSOR_PROBABILISTIC_SAMPLING"),
			Label:      "Probabilistic Sampling",
			Properties: rec.ProposedConfig,
			Position: pipeline.Position{
				X: 400,
				Y: 500,
			},
		})
	}
	return nil
}
