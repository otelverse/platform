# We use a lightweight mock image for the robotics environment since building ROS 2 takes a long time
FROM alpine:latest

# Install curl and bash for E2E testing
RUN apk add --no-cache curl bash jq

WORKDIR /app

# A mock script that outputs simulated robotics telemetry traces
COPY packages/robotics-sdk/docker/simulation-env/mock-robot.sh /app/mock-robot.sh
RUN chmod +x /app/mock-robot.sh

CMD ["/app/mock-robot.sh"]
