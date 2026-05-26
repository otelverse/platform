package pipeline

import (
	"context"
	"fmt"
)

type DeployResult struct {
	ContainerID string
	Status      string
}

func Deploy(ctx context.Context, p *Pipeline) (*DeployResult, error) {
	return nil, fmt.Errorf("deploy not yet implemented")
}
