package main

import (
	"fmt"
	"sync"
	"time"
)

// Example: Concurrency with Goroutines and Channels
func main() {
	urls := []string{"url1", "url2", "url3", "url4", "url5"}
	
	// Semaphore to limit concurrency to 2
	semaphore := make(chan struct{}, 2)
	var wg sync.WaitGroup

	for _, url := range urls {
		wg.Add(1)
		go func(u string) {
			defer wg.Done()
			
			// Acquire semaphore
			semaphore <- struct{}{}
			defer func() { <-semaphore }() // Release
			
			// Simulate fetching
			fmt.Printf("Fetching %s...\n", u)
			time.Sleep(500 * time.Millisecond)
			fmt.Printf("Done fetching %s\n", u)
		}(url)
	}

	wg.Wait()
	fmt.Println("All fetches completed.")
}
