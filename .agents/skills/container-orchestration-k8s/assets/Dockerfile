# Builder stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
# CGO_ENABLED=0 ensures a static binary, crucial for the 'scratch' image
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o main .

# Final stage (Minimal footprint)
FROM scratch

WORKDIR /

# Copy binary from builder
COPY --from=builder /app/main /main

# Copy CA certificates if you make HTTPS calls
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Run as non-root user (Security Best Practice)
USER 1000:1000

EXPOSE 8080

ENTRYPOINT ["/main"]
