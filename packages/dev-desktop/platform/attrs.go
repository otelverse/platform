package main

import (
	"encoding/json"
	"fmt"

	common "go.opentelemetry.io/proto/otlp/common/v1"
)

func attrsToJSON(attrs interface{}) string {
	switch v := attrs.(type) {
	case []*common.KeyValue:
		if len(v) == 0 {
			return "{}"
		}
		m := make(map[string]string, len(v))
		for _, kv := range v {
			m[kv.Key] = valueToString(kv.Value)
		}
		b, _ := json.Marshal(m)
		return string(b)
	case map[string]string:
		if len(v) == 0 {
			return "{}"
		}
		b, _ := json.Marshal(v)
		return string(b)
	}
	return "{}"
}

func attrsToMap(attrs []*common.KeyValue) map[string]string {
	if len(attrs) == 0 {
		return nil
	}
	m := make(map[string]string, len(attrs))
	for _, kv := range attrs {
		m[kv.Key] = valueToString(kv.Value)
	}
	return m
}

func valueToString(v *common.AnyValue) string {
	if v == nil {
		return ""
	}
	switch val := v.Value.(type) {
	case *common.AnyValue_StringValue:
		return val.StringValue
	case *common.AnyValue_IntValue:
		return fmt.Sprintf("%d", val.IntValue)
	case *common.AnyValue_DoubleValue:
		return fmt.Sprintf("%f", val.DoubleValue)
	case *common.AnyValue_BoolValue:
		return fmt.Sprintf("%t", val.BoolValue)
	default:
		return fmt.Sprintf("%v", v.Value)
	}
}

func formatID(id []byte) string {
	if len(id) == 0 {
		return ""
	}
	return fmt.Sprintf("%x", id)
}
