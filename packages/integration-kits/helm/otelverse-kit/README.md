# OTelVerse Kubernetes Helm Kit

This Helm chart deploys the entire OTelVerse observability stack alongside sample microservices into a Kubernetes cluster.

## Prerequisites

- [Helm](https://helm.sh/)
- [Kind](https://kind.sigs.k8s.io/) or a running Kubernetes cluster
- `kubectl`

## Installation via Kind (Automated)

The easiest way to test this kit is by running the automated install script, which creates a local `kind` cluster, builds the necessary Docker images, loads them, and installs the Helm chart.

```bash
./install.sh
```

## Manual Installation

If you already have the Docker images built and available in your cluster or registry:

```bash
helm install otelverse-kit .
```

## Usage

Once the pods are ready, port-forward the platform to access the UI:

```bash
kubectl port-forward svc/otelverse-kit-platform 8080:8080
```

You can port-forward the sample React app to generate traffic:

```bash
kubectl port-forward svc/otelverse-kit-react-app 5173:5173
```
