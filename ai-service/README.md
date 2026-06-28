# AI Service

This microservice handles the advanced reasoning and report generation for the Cognitive Profile Test. It uses **LangGraph** to orchestrate agentic workflows, performing Retrieval-Augmented Generation (RAG) against a **Pinecone** vector database.

## Architecture (Domain-Driven Design)

- **`src/domain/`**: Defines the data models (`UserProfile`, `GeneratedReport`) and the `AgentState`.
- **`src/application/`**: Contains the LangGraph implementation (`workflows/graph.py`, `agents/nodes.py`).
- **`src/infrastructure/`**: Handles external APIs, vector databases, and LLM implementations.
  - `llms/factory.py`: Initializes the LLM (defaulting to Gemini).
  - `vector_store/pinecone_client.py`: Interacts with Pinecone.
- **`src/presentation/`**: Contains the FastAPI application.
- **`evals/`**: Contains offline evaluation scripts using LLM-as-a-judge to grade faithfulness and relevance.

## Requirements

Ensure the following environment variables are set in your `.env`:
- `GEMINI_API_KEY`
- `PINECONE_API_KEY`

## Running Locally

To run the standalone server during development:
```bash
cd ai-service
poetry install
poetry run uvicorn src.presentation.api.main:app --reload --port 8001
```

## Running Evaluations

To benchmark the agent's performance:
```bash
cd ai-service
poetry run python evals/benchmark.py
```

## Running Tests

To run the unit tests:
```bash
cd ai-service
poetry run pytest tests/
```
