package main

import (
	"errors"
	"testing"
	"unicode/utf8"
)

// ProcessInput is the function we want to break.
// It incorrectly assumes the input is always valid UTF-8.
func ProcessInput(input string) (string, error) {
	if len(input) > 100 {
		return "", errors.New("input too long")
	}
	
	// Simulated bug: panic if an invalid UTF-8 byte is found
	if !utf8.ValidString(input) {
		panic("invalid utf-8 encountered in critical section")
	}
	
	return "processed: " + input, nil
}

// Example: Fuzz Test that tries to find panics and edge cases
func FuzzProcessInput(f *testing.F) {
	// Add seed corpus (happy path)
	f.Add("hello world")
	f.Add("short")
	f.Add("A string with exactly 100 characters... (padded to 100) ........................................")

	f.Fuzz(func(t *testing.T, orig string) {
		// We expect the function to return an error or a result, but NEVER panic.
		// If the fuzzer generates invalid UTF-8, it will panic and the test will fail, proving the vulnerability.
		defer func() {
			if r := recover(); r != nil {
				t.Errorf("Function panicked with input %q: %v", orig, r)
			}
		}()

		_, _ = ProcessInput(orig)
	})
}
