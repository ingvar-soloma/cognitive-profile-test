# Retrieval and Augmentation Logic

This document describes how the system retrieves relevant information and uses it to enhance LLM responses.

## Retrieval Strategy
1.  **Query Generation**:
    - When a user completes a test, the system Extracts key findings from their scores (e.g., "Aphantasia: 10/40", "SDAM: Yes").
    - A search query is generated, for example: *"scientific definition of aphantasia with low VVIQ scores and autobiographical memory deficiency"*.
2.  **Vector Search**:
    - The query is embedded and matched against the ChromaDB index using Cosine Similarity.
    - The top-K (default 3-5) most relevant document chunks are retrieved.
3.  **Context Integration**:
    - The retrieved chunks are formatted into a string:
      ```text
      [Source A]: [Chunk Content...]
      [Source B]: [Chunk Content...]
      ```

## Prompt Augmentation
The retrieved context is added to the system prompt in `backend/main.py`.

### New System Prompt Structure
```text
You are a 'Cognitive Systems Architect'... [existing instructions]

### SCIENTIFIC CONTEXT (RETRIEVED):
The following excerpts are from peer-reviewed research and psychological texts relevant to the user's results:
{{retrieved_context}}

### USER DATA:
{{user_results_json}}

Integrate the scientific context into your analysis. Use it to validate the user's experience and provide evidence-based recommendations.
```

## Language Support
- The retrieval query will be generated in English (best for source matching) but the final response will respect the `target_lang` requested by the user.
