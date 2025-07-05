from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document
from typing import List, Dict, Optional
import os

class RAGService:
    def __init__(self):
        """Initialize the RAG service with embeddings and vector store"""
        self.embedding = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2",
            model_kwargs={"device": "cpu"}
        )
        self.vectorstore = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=700,
            chunk_overlap=100,
        )
    
    def process_scraped_content(self, url: str, content: str) -> None:
        """Process and store scraped content in vector database"""
        # Split content into chunks
        chunks = self.text_splitter.split_text(content)
        
        # Create documents with metadata
        documents = [
            Document(
                page_content=chunk,
                metadata={"source": url, "chunk_index": i}
            ) 
            for i, chunk in enumerate(chunks)
        ]
        
        # Create or update vector store (in-memory only)
        if self.vectorstore is None:
            self.vectorstore = Chroma.from_documents(
                documents, 
                self.embedding
            )
        else:
            self.vectorstore.add_documents(documents)
    
    def retrieve_relevant_content(self, query: str, k: int = 5) -> List[Dict]:
        """Retrieve relevant chunks for a query"""
        if not self.vectorstore:
            return []
        
        # Use similarity search with score
        docs_and_scores = self.vectorstore.similarity_search_with_score(query, k=k)
        
        results = []
        for doc, score in docs_and_scores:
            # Convert distance to similarity score (lower distance = higher similarity)
            # Chroma returns L2 distance, so we need to convert
            similarity_score = 1 / (1 + score)
            
            if similarity_score >= 0.1:  # Threshold check
                results.append({
                    "content": doc.page_content,
                    "source": doc.metadata.get("source", ""),
                    "chunk_index": doc.metadata.get("chunk_index", 0),
                    "score": float(similarity_score)
                })
        
        return results
    
    def clear_vectorstore(self):
        """Clear the vector store (useful for testing or reset)"""
        if self.vectorstore:
            self.vectorstore.delete_collection()
            self.vectorstore = None

# Initialize global RAG service
rag_service = RAGService()