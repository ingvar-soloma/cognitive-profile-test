import os
from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Any

class PineconeClient:
    """
    Manages interaction with the Pinecone Vector Database for RAG.
    """
    def __init__(self, index_name: str = "cognitive-profile-rag"):
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.index_name = index_name
        self.pc = None
        self.index = None
        
        if self.api_key:
            self.pc = Pinecone(api_key=self.api_key)
            self._ensure_index()

    def _ensure_index(self):
        if self.index_name not in [idx.name for idx in self.pc.list_indexes()]:
            self.pc.create_index(
                name=self.index_name,
                dimension=768, # e.g. for text-embedding-004
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
        self.index = self.pc.Index(self.index_name)

    def search(self, query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieves top-k relevant documents.
        """
        if not self.index:
            print("Warning: Pinecone not initialized. Returning mocked data.")
            return [{"text": "Aphantasia is the inability to visualize mental images.", "score": 0.99}]
            
        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        return [{"text": match.metadata.get("text", ""), "score": match.score} for match in results.matches]
