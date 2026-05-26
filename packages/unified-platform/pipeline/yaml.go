package pipeline

import (
	"fmt"
	"strings"

	"gopkg.in/yaml.v3"
)

type CollectorConfig struct {
	Receivers  map[string]interface{}            `yaml:"receivers"`
	Processors map[string]interface{}            `yaml:"processors"`
	Exporters  map[string]interface{}            `yaml:"exporters"`
	Service    CollectorService                  `yaml:"service"`
}

type CollectorService struct {
	Pipelines map[string]ServicePipeline `yaml:"pipelines"`
}

type ServicePipeline struct {
	Receivers  []string `yaml:"receivers"`
	Processors []string `yaml:"processors"`
	Exporters  []string `yaml:"exporters"`
}

func nodeTypeToComponentName(nType NodeType) (category string, name string, err error) {
	switch nType {
	case NodeTypeReceiverOTLP:
		return "receivers", "otlp", nil
	case NodeTypeProcessorBatch:
		return "processors", "batch", nil
	case NodeTypeProcessorMemoryLimiter:
		return "processors", "memory_limiter", nil
	case NodeTypeProcessorTailSampling:
		return "processors", "tail_sampling", nil
	case NodeTypeExporterLogging:
		return "exporters", "logging", nil
	case NodeTypeExporterOTLP:
		return "exporters", "otlp", nil
	default:
		return "", "", fmt.Errorf("unknown node type: %s", nType)
	}
}

func buildComponentConfig(n PipelineNode) interface{} {
	switch n.Type {
	case NodeTypeReceiverOTLP:
		endpoint := "0.0.0.0:4317"
		if n.Properties != nil {
			if e, ok := n.Properties["endpoint"].(string); ok && e != "" {
				endpoint = e
			}
		}
		return map[string]interface{}{
			"protocols": map[string]interface{}{
				"grpc": map[string]interface{}{
					"endpoint": endpoint,
				},
			},
		}
	case NodeTypeProcessorBatch:
		return map[string]interface{}{}
	case NodeTypeProcessorMemoryLimiter:
		limit := "512Mi"
		spikeLimit := "128Mi"
		if n.Properties != nil {
			if l, ok := n.Properties["limit_mib"].(string); ok && l != "" {
				limit = l
			}
			if s, ok := n.Properties["spike_limit_mib"].(string); ok && s != "" {
				spikeLimit = s
			}
		}
		return map[string]interface{}{
			"check_interval": "5s",
			"limit_mib":      limit,
			"spike_limit_mib": spikeLimit,
		}
	case NodeTypeProcessorTailSampling:
		return map[string]interface{}{
			"decision_wait": "10s",
			"num_traces":    100,
		}
	case NodeTypeExporterLogging:
		verbosity := "detailed"
		if n.Properties != nil {
			if v, ok := n.Properties["verbosity"].(string); ok && v != "" {
				verbosity = v
			}
		}
		return map[string]interface{}{
			"verbosity": verbosity,
		}
	case NodeTypeExporterOTLP:
		endpoint := "localhost:4317"
		if n.Properties != nil {
			if e, ok := n.Properties["endpoint"].(string); ok && e != "" {
				endpoint = e
			}
		}
		return map[string]interface{}{
			"endpoint": endpoint,
		}
	default:
		return map[string]interface{}{}
	}
}

func ExportYAML(p *Pipeline) (string, error) {
	if len(p.Nodes) == 0 {
		return "", fmt.Errorf("pipeline has no nodes")
	}

	cfg := CollectorConfig{
		Receivers:  make(map[string]interface{}),
		Processors: make(map[string]interface{}),
		Exporters:  make(map[string]interface{}),
		Service: CollectorService{
			Pipelines: make(map[string]ServicePipeline),
		},
	}

	var receiverNames []string
	var processorNames []string
	var exporterNames []string

	nodeNames := make(map[string]string)

	for _, n := range p.Nodes {
		category, name, err := nodeTypeToComponentName(n.Type)
		if err != nil {
			return "", err
		}

		uniqueName := name
		if count := countType(p.Nodes, n.Type); count > 1 {
			uniqueName = name + "/" + n.ID
		}

		nodeNames[n.ID] = uniqueName
		config := buildComponentConfig(n)

		switch category {
		case "receivers":
			cfg.Receivers[uniqueName] = config
			receiverNames = append(receiverNames, uniqueName)
		case "processors":
			cfg.Processors[uniqueName] = config
			processorNames = append(processorNames, uniqueName)
		case "exporters":
			cfg.Exporters[uniqueName] = config
			exporterNames = append(exporterNames, uniqueName)
		}
	}

	includedReceivers := make(map[string]bool)
	includedProcessors := make(map[string]bool)
	includedExporters := make(map[string]bool)

	for _, e := range p.Edges {
		srcName, ok := nodeNames[e.Source]
		if !ok {
			continue
		}
		tgtName, ok := nodeNames[e.Target]
		if !ok {
			continue
		}

		srcNode := findNode(p.Nodes, e.Source)
		tgtNode := findNode(p.Nodes, e.Target)

		if srcNode == nil || tgtNode == nil {
			continue
		}

		switch {
		case isReceiver(srcNode.Type) && isProcessor(tgtNode.Type):
			includedReceivers[srcName] = true
			includedProcessors[tgtName] = true
		case isProcessor(srcNode.Type) && isProcessor(tgtNode.Type):
			includedProcessors[srcName] = true
			includedProcessors[tgtName] = true
		case isProcessor(srcNode.Type) && isExporter(tgtNode.Type):
			includedProcessors[srcName] = true
			includedExporters[tgtName] = true
		case isReceiver(srcNode.Type) && isExporter(tgtNode.Type):
			includedReceivers[srcName] = true
			includedExporters[tgtName] = true
		}
	}

	cfg.Service.Pipelines["traces"] = ServicePipeline{
		Receivers:  sortedKeys(includedReceivers),
		Processors: sortedKeys(includedProcessors),
		Exporters:  sortedKeys(includedExporters),
	}

	if len(cfg.Service.Pipelines["traces"].Receivers) == 0 {
		cfg.Service.Pipelines["traces"] = ServicePipeline{
			Receivers:  receiverNames,
			Processors: processorNames,
			Exporters:  exporterNames,
		}
	}

	out, err := yaml.Marshal(cfg)
	if err != nil {
		return "", fmt.Errorf("yaml marshal failed: %w", err)
	}

	return string(out), nil
}

func isReceiver(t NodeType) bool {
	return t == NodeTypeReceiverOTLP
}

func isProcessor(t NodeType) bool {
	return t == NodeTypeProcessorBatch ||
		t == NodeTypeProcessorMemoryLimiter ||
		t == NodeTypeProcessorTailSampling
}

func isExporter(t NodeType) bool {
	return t == NodeTypeExporterLogging ||
		t == NodeTypeExporterOTLP
}

func countType(nodes []PipelineNode, t NodeType) int {
	count := 0
	for _, n := range nodes {
		if n.Type == t {
			count++
		}
	}
	return count
}

func findNode(nodes []PipelineNode, id string) *PipelineNode {
	for _, n := range nodes {
		if n.ID == id {
			return &n
		}
	}
	return nil
}

func sortedKeys(m map[string]bool) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sortStrings(keys)
	return keys
}

func sortStrings(s []string) {
	n := len(s)
	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			if s[i] > s[j] {
				s[i], s[j] = s[j], s[i]
			}
		}
	}
}

func verifyYAMLOutput(yamlStr string) error {
	if !strings.Contains(yamlStr, "receivers:") {
		return fmt.Errorf("missing receivers section")
	}
	if !strings.Contains(yamlStr, "processors:") {
		return fmt.Errorf("missing processors section")
	}
	if !strings.Contains(yamlStr, "exporters:") {
		return fmt.Errorf("missing exporters section")
	}
	if !strings.Contains(yamlStr, "service:") {
		return fmt.Errorf("missing service section")
	}
	return nil
}
