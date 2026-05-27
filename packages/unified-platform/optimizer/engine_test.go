package optimizer

import (
	"context"
	"testing"
)

func TestAnalyzeTracesHeuristics(t *testing.T) {
	stats := TelemetryStats{
		TotalSpans: 5000,
		SpansPerService: []ServiceSpans{
			{
				ServiceName:     "high-error-svc",
				SpanCount:       1000,
				ErrorCount:      100, // 10% error rate
				AverageDuration: 200 * 1e6,
			},
			{
				ServiceName:     "high-latency-svc",
				SpanCount:       1000,
				ErrorCount:      5,
				AverageDuration: 800 * 1e6, // 800ms
			},
			{
				ServiceName:     "high-volume-svc",
				SpanCount:       3000,
				ErrorCount:      0,
				AverageDuration: 50 * 1e6, // 50ms
			},
		},
	}

	// We can pass a nil DB because the PII detection will handle it or we can stub it out.
	// Actually, passing nil db will cause a panic or err in db.QueryContext.
	// We'll skip testing PII here since it requires a real DB connection or mock.
	
	recs, err := AnalyzeTraces(context.Background(), nil, stats, "now-1h", "now")
	if err != nil {
		t.Fatalf("AnalyzeTraces failed: %v", err)
	}

	if len(recs) != 3 {
		t.Fatalf("expected 3 recommendations, got %d", len(recs))
	}

	hasTailSampling := false
	hasLatency := false
	hasProbabilistic := false

	for _, rec := range recs {
		switch rec.ID {
		case "tail-sampling-high-error-svc":
			hasTailSampling = true
		case "latency-sampling-high-latency-svc":
			hasLatency = true
		case "probabilistic-high-volume-svc":
			hasProbabilistic = true
		}
	}

	if !hasTailSampling || !hasLatency || !hasProbabilistic {
		t.Errorf("missing expected recommendations: tail=%v, latency=%v, prob=%v", hasTailSampling, hasLatency, hasProbabilistic)
	}
}
