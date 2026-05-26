package pipeline

import "fmt"

func Validate(p *Pipeline) (bool, []string) {
	if len(p.Nodes) == 0 {
		return false, []string{"pipeline must have at least one node"}
	}
	return true, nil
}

func ExportYAML(p *Pipeline) (string, error) {
	return "", fmt.Errorf("yaml export not yet implemented")
}
