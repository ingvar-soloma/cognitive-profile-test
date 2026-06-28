package main

import (
	"context"
	"fmt"
	"log"

	"github.com/qdrant/go-client/qdrant"
)

// Example: Semantic search using Qdrant Go Client
func main() {
	// Connect to Qdrant
	client, err := qdrant.NewClient(&qdrant.Config{
		Host: "localhost",
		Port: 6334,
	})
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer client.Close()

	ctx := context.Background()

	// Perform a basic vector search
	results, err := client.Query(ctx, &qdrant.QueryPoints{
		CollectionName: "documents",
		Query:          qdrant.NewQuery(0.1, 0.2, 0.3, 0.4),
		Limit:          5,
		WithPayload:    qdrant.NewWithPayload(true),
	})
	if err != nil {
		log.Fatalf("Search failed: %v", err)
	}

	for _, point := range results {
		fmt.Printf("Found Point ID: %v, Score: %f\n", point.Id, point.Score)
	}
}
