FROM golang:alpine AS builder

WORKDIR /app
COPY packages/chaos-engine/agent/go.mod ./
COPY packages/chaos-engine/agent/ ./
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/chaos-agent ./cmd/agent/main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/chaos-agent .
EXPOSE 8083
CMD ["./chaos-agent"]
