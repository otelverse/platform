package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

type VMQueryRangeResponse struct {
	Status string `json:"status"`
	Data   struct {
		ResultType string `json:"resultType"`
		Result     []struct {
			Metric map[string]string `json:"metric"`
			Values [][]interface{}   `json:"values"`
		} `json:"result"`
	} `json:"data"`
}

func (r *GraphQLResolver) resolveMetrics(ctx context.Context, vars map[string]interface{}) (interface{}, error) {
	if r.victoriaMetricsURL == "" {
		return nil, fmt.Errorf("victoriaMetricsURL is not configured")
	}

	query, _ := vars["query"].(string)
	startTime, _ := vars["startTime"].(string)
	endTime, _ := vars["endTime"].(string)
	step, _ := vars["step"].(float64)

	if query == "" || startTime == "" || endTime == "" || step <= 0 {
		return nil, fmt.Errorf("query, startTime, endTime, and step are required")
	}

	endpoint := fmt.Sprintf("%s/api/v1/query_range", r.victoriaMetricsURL)
	reqURL, err := url.Parse(endpoint)
	if err != nil {
		return nil, fmt.Errorf("invalid vm url: %w", err)
	}

	q := reqURL.Query()
	q.Set("query", query)
	q.Set("start", startTime)
	q.Set("end", endTime)
	q.Set("step", fmt.Sprintf("%d", int(step)))
	reqURL.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to query victoriametrics: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("victoriametrics returned status %d: %s", resp.StatusCode, string(body))
	}

	var vmResp VMQueryRangeResponse
	if err := json.NewDecoder(resp.Body).Decode(&vmResp); err != nil {
		return nil, fmt.Errorf("failed to decode vm response: %w", err)
	}

	if vmResp.Status != "success" {
		return nil, fmt.Errorf("victoriametrics error: %s", vmResp.Status)
	}

	var results []interface{}
	for _, res := range vmResp.Data.Result {
		metricName := res.Metric["__name__"]
		if metricName == "" {
			metricName = query // fallback if it's a complex query without a specific name
		}

		labels := make(map[string]interface{})
		for k, v := range res.Metric {
			if k != "__name__" {
				labels[k] = v
			}
		}

		var values []interface{}
		for _, val := range res.Values {
			if len(val) != 2 {
				continue
			}

			// val[0] is unix timestamp in float64/int
			var ts string
			switch v := val[0].(type) {
			case float64:
				ts = fmt.Sprintf("%.0f", v)
			case int:
				ts = fmt.Sprintf("%d", v)
			default:
				ts = fmt.Sprintf("%v", v)
			}

			// val[1] is the value as string usually in prometheus API
			var v float64
			switch valStr := val[1].(type) {
			case string:
				fmt.Sscanf(valStr, "%f", &v)
			case float64:
				v = valStr
			}

			values = append(values, map[string]interface{}{
				"timestamp": ts,
				"value":     v,
			})
		}

		results = append(results, map[string]interface{}{
			"metricName": metricName,
			"labels":     labels,
			"values":     values,
		})
	}

	return map[string]interface{}{"metrics": results}, nil
}
