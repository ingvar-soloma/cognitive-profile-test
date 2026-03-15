# Data Ingestion Pipeline

To populate the Knowledge Base, we need a robust pipeline to process diverse scientific sources.

## Data Sources
1.  **Scientific Papers**: PDFs of studies by Adam Zeman, Brian Levine, etc.
2.  **Psychology Books**: EPUB or TXT versions of core textbooks on cognitive profiles.
3.  **Curated Research**: Manually compiled Markdown files containing key summaries and definitions.

## Processing Steps
1.  **Loading**: 
    - Use `PyPDF2` or `unstructured` for PDF extraction.
    - Use `pandoc` or `BeautifulSoup` for HTML/EPUB content.
2.  **Cleaning**:
    - Remove headers, footers, and bibliographies to reduce noise.
    - Normalize whitespace.
3.  **Chunking**:
    - **Strategy**: Semantic or Recursive Character Splitting.
    - **Chunk Size**: ~500-1000 characters.
    - **Overlap**: ~100-200 characters (to maintain context across chunks).
4.  **Embedding**:
    - Convert chunks into high-dimensional vectors.
    - Use Google's `text-embedding-004` model for compatibility with the Gemini ecosystem.
5.  **Indexing**:
    - Store the vectors and original text (metadata) in a local ChromaDB instance.
    - Include metadata like `source_title`, `author`, `page_number`, and `category` (e.g., "Aphantasia", "SDAM").

## Automation
- A Python script `backend/rag/ingest.py` will be created to automate this process.
- Researchers can drop new papers into `backend/data/knowledge_base/` and run the script to update the index.
