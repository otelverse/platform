package pipeline

func Validate(p *Pipeline) (bool, []string) {
	var errors []string

	if len(p.Nodes) == 0 {
		return false, []string{"pipeline must have at least one node"}
	}

	hasReceiver := false
	hasExporter := false
	nodeIDs := make(map[string]bool)
	nodeTypeMap := make(map[string]NodeType)

	for _, n := range p.Nodes {
		nodeIDs[n.ID] = true
		nodeTypeMap[n.ID] = n.Type
		switch n.Type {
		case NodeTypeReceiverOTLP:
			hasReceiver = true
		case NodeTypeProcessorBatch, NodeTypeProcessorMemoryLimiter, NodeTypeProcessorTailSampling:
		case NodeTypeExporterLogging, NodeTypeExporterOTLP:
			hasExporter = true
		default:
			errors = append(errors, "unknown node type: "+string(n.Type))
		}
	}

	if !hasReceiver {
		errors = append(errors, "pipeline must have at least one receiver node")
	}
	if !hasExporter {
		errors = append(errors, "pipeline must have at least one exporter node")
	}

	orphanNodeIDs := make(map[string]bool)
	for _, n := range p.Nodes {
		orphanNodeIDs[n.ID] = true
	}

	incomingEdges := make(map[string]int)
	outgoingEdges := make(map[string]int)
	for _, e := range p.Edges {
		if !nodeIDs[e.Source] {
			errors = append(errors, "edge source not found: "+e.Source)
		}
		if !nodeIDs[e.Target] {
			errors = append(errors, "edge target not found: "+e.Target)
		}
		outgoingEdges[e.Source]++
		incomingEdges[e.Target]++
		delete(orphanNodeIDs, e.Source)
		delete(orphanNodeIDs, e.Target)
	}

	for id := range orphanNodeIDs {
		if nodeTypeMap[id] != "" {
			errors = append(errors, "orphan node not connected by any edge: "+id)
		}
	}

	for id, nType := range nodeTypeMap {
		switch nType {
		case NodeTypeReceiverOTLP:
			if incomingEdges[id] > 0 {
				errors = append(errors, "receiver node should not have incoming edges: "+id)
			}
		case NodeTypeExporterLogging, NodeTypeExporterOTLP:
			if outgoingEdges[id] > 0 {
				errors = append(errors, "exporter node should not have outgoing edges: "+id)
			}
		}
	}

	receiverNodeIDs := make(map[string]bool)
	for _, n := range p.Nodes {
		switch n.Type {
		case NodeTypeReceiverOTLP:
			receiverNodeIDs[n.ID] = true
		}
	}

	for _, e := range p.Edges {
		if receiverNodeIDs[e.Target] {
			errors = append(errors, "receiver cannot be a target of an edge: "+e.Target)
		}
	}

	for _, n := range p.Nodes {
		if n.Type == NodeTypeReceiverOTLP {
			if n.Properties == nil {
				errors = append(errors, "OTLP receiver requires properties (endpoint)")
			} else if _, ok := n.Properties["endpoint"]; !ok {
				errors = append(errors, "OTLP receiver requires endpoint property")
			}
		}
	}

	if len(errors) > 0 {
		return false, errors
	}
	return true, nil
}
