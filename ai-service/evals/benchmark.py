import json
from evals.metrics import LLMJudge

def run_benchmarks():
    """
    Runs offline benchmarks on a dataset of user profiles and generated reports.
    """
    print("Initializing LLM Judge (Gemini)...")
    judge = LLMJudge(provider="gemini", model_name="gemini-3.1-pro")
    
    # Mock data for demonstration
    mock_dataset = [
        {
            "profile": "User scored highly on aphantasia test (VVIQ: 16).",
            "context": "Aphantasia is the inability to voluntarily create mental images in one's mind.",
            "report": "Based on your VVIQ score of 16, you have strong indicators of aphantasia, meaning you experience a lack of visual imagery."
        }
    ]
    
    results = []
    for item in mock_dataset:
        faithfulness = judge.evaluate_faithfulness(item["context"], item["report"])
        relevance = judge.evaluate_relevance(item["profile"], item["report"])
        
        results.append({
            "faithfulness_score": faithfulness.score,
            "faithfulness_reasoning": faithfulness.reasoning,
            "relevance_score": relevance.score,
            "relevance_reasoning": relevance.reasoning
        })
        
    print("\nBenchmark Results:")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    # Ensure GEMINI_API_KEY is set in environment before running
    run_benchmarks()
