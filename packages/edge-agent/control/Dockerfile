FROM golang:alpine AS builder

WORKDIR /app
COPY packages/edge-agent/control/ ./
RUN go mod init edge-control && go get github.com/lib/pq github.com/go-chi/chi/v5 && go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/edge-control ./main.go ./db.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/edge-control .
EXPOSE 8084
CMD ["./edge-control"]
