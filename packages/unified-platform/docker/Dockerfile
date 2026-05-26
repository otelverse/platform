FROM golang:1.25-alpine AS builder

WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o platform .

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /build/platform /platform
COPY --from=builder /build/migrations /migrations

EXPOSE 8080 4317
ENTRYPOINT ["/platform"]
