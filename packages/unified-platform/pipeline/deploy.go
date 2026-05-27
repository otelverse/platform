package pipeline

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/docker/go-connections/nat"
	ocispec "github.com/opencontainers/image-spec/specs-go/v1"
)

type DeployResult struct {
	ContainerID string
	Status      string
}

type dockerClient interface {
	ImagePull(ctx context.Context, refStr string, options image.PullOptions) (io.ReadCloser, error)
	ContainerCreate(ctx context.Context, config *container.Config, hostConfig *container.HostConfig, networkingConfig *network.NetworkingConfig, platform *ocispec.Platform, containerName string) (container.CreateResponse, error)
	ContainerStart(ctx context.Context, containerID string, options container.StartOptions) error
	ContainerRemove(ctx context.Context, containerID string, options container.RemoveOptions) error
	Close() error
}

type realDockerClient struct {
	cli *client.Client
}

func (r *realDockerClient) ImagePull(ctx context.Context, refStr string, options image.PullOptions) (io.ReadCloser, error) {
	return r.cli.ImagePull(ctx, refStr, options)
}

func (r *realDockerClient) ContainerCreate(ctx context.Context, config *container.Config, hostConfig *container.HostConfig, networkingConfig *network.NetworkingConfig, platform *ocispec.Platform, containerName string) (container.CreateResponse, error) {
	return r.cli.ContainerCreate(ctx, config, hostConfig, networkingConfig, platform, containerName)
}

func (r *realDockerClient) ContainerStart(ctx context.Context, containerID string, options container.StartOptions) error {
	return r.cli.ContainerStart(ctx, containerID, options)
}

func (r *realDockerClient) ContainerRemove(ctx context.Context, containerID string, options container.RemoveOptions) error {
	return r.cli.ContainerRemove(ctx, containerID, options)
}

func (r *realDockerClient) Close() error {
	return r.cli.Close()
}

func newDockerClient() (dockerClient, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, fmt.Errorf("docker client: %w", err)
	}
	return &realDockerClient{cli: cli}, nil
}

const collectorImage = "otel/opentelemetry-collector-contrib:latest"

func Deploy(ctx context.Context, p *Pipeline) (*DeployResult, error) {
	yamlStr, err := ExportYAML(p)
	if err != nil {
		return nil, fmt.Errorf("yaml export: %w", err)
	}

	docker, err := newDockerClient()
	if err != nil {
		return nil, fmt.Errorf("connect to docker: %w", err)
	}
	defer docker.Close()

	pullReader, err := docker.ImagePull(ctx, collectorImage, image.PullOptions{})
	if err != nil {
		return nil, fmt.Errorf("pull image: %w", err)
	}
	pullReader.Close()

	tmpDir, err := os.MkdirTemp("", "otel-collector-*")
	if err != nil {
		return nil, fmt.Errorf("create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	configPath := filepath.Join(tmpDir, "config.yaml")
	if err := os.WriteFile(configPath, []byte(yamlStr), 0644); err != nil {
		return nil, fmt.Errorf("write config: %w", err)
	}

	containerCfg := &container.Config{
		Image: collectorImage,
		ExposedPorts: nat.PortSet{
			"4317/tcp": struct{}{},
		},
	}

	hostCfg := &container.HostConfig{
		Binds: []string{
			configPath + ":/etc/otelcol-contrib/config.yaml:ro",
		},
		PortBindings: nat.PortMap{
			"4317/tcp": []nat.PortBinding{
				{HostIP: "0.0.0.0", HostPort: "4317"},
			},
		},
	}

	resp, err := docker.ContainerCreate(ctx, containerCfg, hostCfg, nil, nil, "")
	if err != nil {
		return nil, fmt.Errorf("create container: %w", err)
	}

	if err := docker.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		docker.ContainerRemove(ctx, resp.ID, container.RemoveOptions{})
		return nil, fmt.Errorf("start container: %w", err)
	}

	return &DeployResult{
		ContainerID: resp.ID[:12],
		Status:      "running",
	}, nil
}
