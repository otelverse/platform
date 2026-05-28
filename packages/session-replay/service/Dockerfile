FROM golang:alpine AS builder

WORKDIR /app
COPY packages/session-replay/service/go.mod packages/session-replay/service/go.sum ./packages/session-replay/service/
WORKDIR /app/packages/session-replay/service
RUN go mod download

COPY packages/session-replay/service/ .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/service ./cmd/server/main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/service .
EXPOSE 8082
CMD ["./service"]
