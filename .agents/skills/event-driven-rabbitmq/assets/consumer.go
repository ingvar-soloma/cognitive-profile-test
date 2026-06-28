package main

import (
	"context"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

// Example: Reliable RabbitMQ Consumer
func main() {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open channel: %v", err)
	}
	defer ch.Close()

	// Consume with manual acknowledgments
	deliveries, err := ch.Consume(
		"order-queue",
		"order-consumer",
		false, // autoAck (set to false for manual ack)
		false, // exclusive
		false, // noLocal
		false, // noWait
		nil,   // arguments
	)
	if err != nil {
		log.Fatalf("Failed to consume: %v", err)
	}

	for delivery := range deliveries {
		log.Printf("Received message: %s", delivery.Body)

		// Process message (e.g., Saga transaction step)
		if err := processMessage(delivery.Body); err != nil {
			log.Printf("Processing error, requeuing")
			delivery.Nack(false, true) // Requeue
		} else {
			delivery.Ack(false) // Acknowledge success
		}
	}
}

func processMessage(body []byte) error {
	return nil
}
