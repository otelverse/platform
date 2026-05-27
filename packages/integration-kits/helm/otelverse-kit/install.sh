#!/usr/bin/env bash
set -eo pipefail

echo "This script assumes you have kind and helm installed."

CLUSTER_NAME="otelverse-demo"

if ! kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
  echo "Creating kind cluster ${CLUSTER_NAME}..."
  kind create cluster --name ${CLUSTER_NAME}
else
  echo "Cluster ${CLUSTER_NAME} already exists."
fi

echo "Building local Docker images..."
cd ../../compose/otelverse-kit/apps/express-app
docker build -t otelverse/express-app:latest .
cd ../react-app
docker build -t otelverse/react-app:latest .
cd ../../../../../unified-platform
docker build -t otelverse/platform:latest -f docker/Dockerfile .

echo "Loading images into kind cluster..."
kind load docker-image otelverse/express-app:latest --name ${CLUSTER_NAME}
kind load docker-image otelverse/react-app:latest --name ${CLUSTER_NAME}
kind load docker-image otelverse/platform:latest --name ${CLUSTER_NAME}

echo "Installing Helm chart..."
cd ../integration-kits/helm
helm upgrade --install otelverse-kit ./otelverse-kit

echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=platform --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=express-app --timeout=120s || true

echo "✅ Installation complete!"
echo "To access the Platform, run: kubectl port-forward svc/otelverse-kit-platform 8080:8080"
echo "To access the React App, run: kubectl port-forward svc/otelverse-kit-react-app 5173:5173"
