import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Set tokenizers parallelism to avoid fork warnings
os.environ["TOKENIZERS_PARALLELISM"] = "false"

from langchain_anthropic import ChatAnthropic
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.docstore.document import Document

# Load environment variables from .env file
load_dotenv()

# Set API keys from environment variables
os.environ["ANTHROPIC_API_KEY"] = os.getenv("ANTHROPIC_API_KEY")

# Pydantic models
class RagRequest(BaseModel):
    query: str
    top_k: int = 5
    temperature: float = 0.2

class SourceDocument(BaseModel):
    content: str
    score: float

class RagResponse(BaseModel):
    answer: str
    sources: List[SourceDocument]

# Global variables for vectorstore and LLM
vectorstore = None
llm = None

def load_vectorstore():
    """Load and initialize the vectorstore with documents."""
    global vectorstore
    
    # Read the sample text file
    print("Loading text file...")
    with open("data/flyff_clockworks.txt", "r", encoding="utf-8") as f:
        raw_text = f.read()
    
    # Split text into smaller chunks for processing
    print("Splitting text into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=100,
    )
    docs = text_splitter.split_text(raw_text)
    
    # Convert text chunks into Document objects
    documents = [Document(page_content=chunk) for chunk in docs]
    print(f"Created {len(documents)} document chunks")
    
    # Create embeddings using HuggingFace's free sentence transformer model
    print("Creating embeddings...")
    embedding = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-mpnet-base-v2", 
        model_kwargs={"device": "cpu"}
    )
    
    # Store embeddings in Chroma vector database
    vectorstore = Chroma.from_documents(documents, embedding)
    print("Vectorstore loaded successfully!")
    return vectorstore

def get_llm():
    """Initialize and return the LLM."""
    global llm
    
    llm = ChatAnthropic(
        model="claude-3-haiku-20240307",
        temperature=0.7,
        max_tokens=1024,
    )
    return llm

def rag_answer(query: str, k: int = 5, temperature: float = 0.2):
    """Core RAG logic reused by both CLI and API."""
    global vectorstore, llm
    
    if not vectorstore:
        raise ValueError("Vectorstore not initialized")
    if not llm:
        raise ValueError("LLM not initialized")
    
    # Create a retriever to find relevant chunks
    retriever = vectorstore.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"k": k, "score_threshold": 0.1},
    )
    
    # Set up the QA chain with retrieval
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff",
    )
    
    # Get the result and source documents
    result = qa_chain.invoke({"query": query})
    
    # Get source documents with scores
    docs_with_scores = vectorstore.similarity_search_with_score(query, k=k)
    sources = [
        SourceDocument(content=doc.page_content, score=float(score))
        for doc, score in docs_with_scores
    ]
    
    return {
        "answer": result["result"],
        "sources": sources
    }

# Initialize FastAPI app
app = FastAPI(title="RAG API", description="Simple RAG API with Claude")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize vectorstore and LLM on startup
@app.on_event("startup")
async def startup_event():
    load_vectorstore()
    get_llm()
    print("✅ RAG system ready with Claude!")

@app.post("/rag/search", response_model=RagResponse)
async def rag_search(request: RagRequest):
    """RAG search endpoint."""
    try:
        result = rag_answer(request.query, request.top_k, request.temperature)
        return RagResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount static files
app.mount("/static", StaticFiles(directory="static", html=True), name="static")

# Root endpoint redirects to static
@app.get("/")
async def root():
    return {"message": "Visit /static/index.html for the frontend"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)