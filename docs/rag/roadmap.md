# Implementation Roadmap

The implementation of the RAG system is divided into four phases.

## Phase 1: Environment and Setup
- [ ] Install dependencies: `langchain`, `chromadb`, `pypdf`, `google-cloud-aiplatform`.
- [ ] Setup folder structure: `backend/rag/`, `backend/data/knowledge_base/`.
- [ ] Configure environment variables: `VECTOR_DB_PATH`, `GOOGLE_APPLICATION_CREDENTIALS`.

## Phase 2: Knowledge Base Ingestion
- [ ] Create `ingest.py` script.
- [ ] Implement PDF and Markdown loaders.
- [ ] Implement recursive character splitting.
- [ ] Integrate Google Embedding API.
- [ ] Test indexing with a sample set of scientific papers.

## Phase 3: RAG Service Integration
- [ ] Create `rag/service.py` with retrieval logic.
- [ ] implement similarity search with metadata filtering.
- [ ] Modify `backend/main.py` to retrieve context before calling Gemini.
- [ ] Update system instructions to include the `{{retrieved_context}}` placeholder.

## Phase 4: Testing and Refinement
- [ ] Verify that scientific terms are used correctly in reports.
- [ ] Tune chunk size and top-K parameters for optimal performance.
- [ ] (Optional) Add a reference section to the report footer listing the sources used.
