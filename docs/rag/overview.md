# RAG System Overview

The Retrieval-Augmented Generation (RAG) system aims to enhance the cognitive profile reports by grounding the LLM's output in high-quality scientific literature and expert knowledge.

## Purpose
- **Accuracy**: Reduce hallucinations regarding neuropsychological concepts.
- **Depth**: Provide more nuanced explanations based on specific research (e.g., Adam Zeman, Brian Levine).
- **Personalization**: Match user results with specific findings in the literature.

## High-Level Architecture
1.  **Knowledge Base**: A curated collection of scientific papers (PDFs), book excerpts (Markdown/Text), and psychological guidelines.
2.  **Ingestion Pipeline**: 
    - Text Extraction
    - Semantic Chunking
    - Vector Embedding (using Google Text Embeddings)
    - Vector Storage (ChromaDB or FAISS)
3.  **Retrieval Engine**:
    - Query formulation based on test scores and answers.
    - Similarity search in the vector store.
    - Re-ranking (optional) to select most relevant snippets.
4.  **Augmented Generation**:
    - The retrieved snippets are injected into the Gemini system prompt.
    - Gemini synthesizes the final report using both the user data and the scientific context.

## Component Stack
- **Language**: Python (existing backend)
- **AI Framework**: LangChain or LlamaIndex (for RAG orchestration)
- **Vector DB**: ChromaDB (lightweight, local storage)
- **LLM**: Gemini 3.1 Pro / 3.1 Flash
- **Embeddings**: `text-embedding-004` (Google)
