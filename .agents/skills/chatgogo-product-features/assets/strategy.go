package matchmaking

// MatchingStrategy defines the interface for different matchmaking algorithms
type MatchingStrategy interface {
	FindMatch(userID string) (partnerID string, err error)
}

// ProfileMatchingStrategy implements matchmaking based on user profile interests
type ProfileMatchingStrategy struct {
	// dependencies like DB or Redis go here
}

func (s *ProfileMatchingStrategy) FindMatch(userID string) (string, error) {
	// 1. Fetch user profile
	// 2. Query Qdrant for similar users based on embeddings of their interests
	// 3. Return best match
	return "matched_user_123", nil
}

// MatcherContext is the service that uses the strategy
type MatcherContext struct {
	strategy MatchingStrategy
}

func (m *MatcherContext) SetStrategy(s MatchingStrategy) {
	m.strategy = s
}

func (m *MatcherContext) ExecuteMatch(userID string) (string, error) {
	return m.strategy.FindMatch(userID)
}
