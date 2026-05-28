package uql

import (
	"fmt"
	"strconv"
	"strings"
)

// QueryType represents the type of UQL query.
type QueryType int

const (
	QueryTypeTraces QueryType = iota
	QueryTypeLogs
)

// Operator represents a filter operator.
type Operator string

const (
	OpEqual    Operator = "="
	OpNotEqual Operator = "!="
	OpContains Operator = "contains"
)

// Filter represents a single where clause.
type Filter struct {
	Field    string   `json:"field"`
	Operator Operator `json:"operator"`
	Value    string   `json:"value"`
}

// Query represents a parsed UQL query.
type Query struct {
	Type        QueryType        `json:"type"`
	Filters     []Filter         `json:"filters"`
	Limit       int              `json:"limit"`
	Aggregation *AggregationNode `json:"aggregation,omitempty"`
	Join        *JoinNode        `json:"join,omitempty"`
}

// Parser is a recursive descent parser for UQL.
type Parser struct {
	input []string
	pos   int
}

// NewParser creates a new UQL parser.
func NewParser(input string) *Parser {
	tokens := tokenize(input)
	return &Parser{input: tokens, pos: 0}
}

func tokenize(input string) []string {
	var tokens []string
	input = strings.TrimSpace(input)
	if input == "" {
		return tokens
	}

	i := 0
	for i < len(input) {
		c := input[i]
		if c == ' ' || c == '\t' {
			i++
			continue
		}
		if c == '|' {
			tokens = append(tokens, "|")
			i++
			continue
		}
		if c == '"' {
			j := i + 1
			for j < len(input) && input[j] != '"' {
				j++
			}
			if j < len(input) {
				tokens = append(tokens, input[i+1:j])
				i = j + 1
				continue
			}
			tokens = append(tokens, input[i+1:])
			break
		}
		if strings.ContainsRune("=!", rune(c)) {
			if i+1 < len(input) && input[i+1] == '=' {
				if c == '!' {
					tokens = append(tokens, "!=")
				} else {
					tokens = append(tokens, "=")
				}
				i += 2
				continue
			}
			tokens = append(tokens, string(c))
			i++
			continue
		}
		if strings.ContainsRune("(),", rune(c)) {
			tokens = append(tokens, string(c))
			i++
			continue
		}
		if c == '\'' {
			j := i + 1
			for j < len(input) && input[j] != '\'' {
				j++
			}
			if j < len(input) {
				tokens = append(tokens, input[i+1:j])
				i = j + 1
				continue
			}
			tokens = append(tokens, input[i+1:])
			break
		}
		start := i
		for i < len(input) && !strings.ContainsRune(" \t|(),", rune(input[i])) {
			i++
		}
		tokens = append(tokens, input[start:i])
	}
	return tokens
}

// Parse parses a UQL query string.
func (p *Parser) Parse() (*Query, error) {
	if len(p.input) == 0 {
		return nil, fmt.Errorf("empty query")
	}

	q := &Query{Limit: 100}

	switch p.input[p.pos] {
	case "traces":
		q.Type = QueryTypeTraces
	case "logs":
		q.Type = QueryTypeLogs
	default:
		return nil, fmt.Errorf("expected 'traces' or 'logs', got '%s'", p.input[p.pos])
	}
	p.pos++

	for p.pos < len(p.input) {
		tok := p.input[p.pos]

		if tok == "|" {
			p.pos++
			if p.pos >= len(p.input) {
				return nil, fmt.Errorf("unexpected end after '|'")
			}
			next := p.input[p.pos]
			if next == "where" {
				filter, err := p.parseFilter()
				if err != nil {
					return nil, err
				}
				q.Filters = append(q.Filters, *filter)
			} else if next == "limit" {
				limit, err := p.parseLimit()
				if err != nil {
					return nil, err
				}
				q.Limit = limit
			} else if next == "by" {
				agg, err := p.parseAggregation()
				if err != nil {
					return nil, err
				}
				q.Aggregation = agg
			} else if isAggregationFunction(next) {
				agg, err := p.parseAggregationFunctions(nil)
				if err != nil {
					return nil, err
				}
				q.Aggregation = agg
			} else if next == "join" {
				join, err := p.parseJoin()
				if err != nil {
					return nil, err
				}
				q.Join = join
			} else {
				return nil, fmt.Errorf("expected 'where', 'limit', 'by', 'join' or aggregation function after '|', got '%s'", next)
			}
		} else {
			return nil, fmt.Errorf("unexpected token '%s'", tok)
		}
	}

	return q, nil
}

func isAggregationFunction(name string) bool {
	switch name {
	case "count", "avg", "p95", "min", "max", "sum":
		return true
	}
	return false
}

func (p *Parser) parseAggregation() (*AggregationNode, error) {
	if p.pos >= len(p.input) || p.input[p.pos] != "by" {
		return nil, fmt.Errorf("expected 'by'")
	}
	p.pos++

	if p.pos >= len(p.input) {
		return nil, fmt.Errorf("expected field after 'by'")
	}
	field := p.input[p.pos]
	p.pos++

	return p.parseAggregationFunctions(&field)
}

func (p *Parser) parseAggregationFunctions(groupByField *FieldOpt) (*AggregationNode, error) {
	agg := &AggregationNode{}
	if groupByField != nil {
		agg.GroupByField = *groupByField
	}

	// We might have a '|' before the aggregation functions if called after 'by'
	if p.pos < len(p.input) && p.input[p.pos] == "|" {
		p.pos++
	}

	if p.pos >= len(p.input) {
		if groupByField != nil {
			// If we just had "by field" and end of query, default to count
			agg.Functions = append(agg.Functions, AggregationFunction{Name: "count"})
			return agg, nil
		}
		return nil, fmt.Errorf("expected aggregation function")
	}
	
	// If the next token is an aggregation function, parse it
	if isAggregationFunction(p.input[p.pos]) {
		for p.pos < len(p.input) {
			funcName := p.input[p.pos]
			if !isAggregationFunction(funcName) {
				// If we hit something else, maybe we're done parsing functions
				break
			}
			p.pos++

			fn := AggregationFunction{Name: funcName}
			
			if funcName != "count" {
				if p.pos >= len(p.input) || p.input[p.pos] != "(" {
					return nil, fmt.Errorf("expected '(' after '%s'", funcName)
				}
				p.pos++
				
				if p.pos >= len(p.input) {
					return nil, fmt.Errorf("expected field inside '%s'", funcName)
				}
				fn.Field = p.input[p.pos]
				p.pos++
				
				if p.pos >= len(p.input) || p.input[p.pos] != ")" {
					return nil, fmt.Errorf("expected ')' after field in '%s'", funcName)
				}
				p.pos++
			}
			
			agg.Functions = append(agg.Functions, fn)
			
			if p.pos < len(p.input) && p.input[p.pos] == "," {
				p.pos++ // skip comma and loop
			} else {
				break
			}
		}
	} else if groupByField != nil {
		// If we had "by field" but no explicit functions follow, default to count
		agg.Functions = append(agg.Functions, AggregationFunction{Name: "count"})
	} else {
		return nil, fmt.Errorf("expected aggregation function, got '%s'", p.input[p.pos])
	}

	return agg, nil
}

type FieldOpt = string

func (p *Parser) parseJoin() (*JoinNode, error) {
	if p.pos >= len(p.input) || p.input[p.pos] != "join" {
		return nil, fmt.Errorf("expected 'join'")
	}
	p.pos++

	if p.pos >= len(p.input) {
		return nil, fmt.Errorf("expected signal type after 'join'")
	}
	
	targetSignal := QueryTypeLogs
	if p.input[p.pos] == "logs" {
		targetSignal = QueryTypeLogs
	} else if p.input[p.pos] == "metrics" {
		targetSignal = QueryTypeTraces // Placeholder, metrics join deferred
	} else {
		return nil, fmt.Errorf("expected 'logs' after join")
	}
	p.pos++
	
	if p.pos >= len(p.input) || p.input[p.pos] != "on" {
		return nil, fmt.Errorf("expected 'on' after join target")
	}
	p.pos++
	
	if p.pos >= len(p.input) {
		return nil, fmt.Errorf("expected field after 'on'")
	}
	onField := p.input[p.pos]
	p.pos++
	
	return &JoinNode{TargetSignal: targetSignal, OnField: onField}, nil
}

func (p *Parser) parseFilter() (*Filter, error) {
	if p.pos >= len(p.input) || p.input[p.pos] != "where" {
		return nil, fmt.Errorf("expected 'where'")
	}
	p.pos++

	if p.pos >= len(p.input) {
		return nil, fmt.Errorf("expected field after 'where'")
	}
	field := p.input[p.pos]
	p.pos++

	if p.pos >= len(p.input) {
		return nil, fmt.Errorf("expected operator after field '%s'", field)
	}

	var op Operator
	switch p.input[p.pos] {
	case "=":
		op = OpEqual
	case "!=":
		op = OpNotEqual
	case "contains":
		op = OpContains
	default:
		return nil, fmt.Errorf("expected operator (=, !=, contains), got '%s'", p.input[p.pos])
	}
	p.pos++

	if p.pos >= len(p.input) {
		return nil, fmt.Errorf("expected value after operator")
	}
	value := p.input[p.pos]
	p.pos++

	return &Filter{Field: field, Operator: op, Value: value}, nil
}

func (p *Parser) parseLimit() (int, error) {
	if p.pos >= len(p.input) || p.input[p.pos] != "limit" {
		return 0, fmt.Errorf("expected 'limit'")
	}
	p.pos++

	if p.pos >= len(p.input) {
		return 0, fmt.Errorf("expected number after 'limit'")
	}

	limit, err := strconv.Atoi(p.input[p.pos])
	if err != nil {
		return 0, fmt.Errorf("invalid limit value '%s': %w", p.input[p.pos], err)
	}
	p.pos++

	return limit, nil
}
