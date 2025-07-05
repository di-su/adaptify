import os
from dotenv import load_dotenv

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

# Read the sample text file
print("Loading text file...")
with open("data/flyff_clockworks.txt", "r", encoding="utf-8") as f:
    raw_text = f.read()

    # Debug: show summary of the raw text (length and a 200-char preview)
    print(f"Raw text length: {len(raw_text):,} characters")
    print("Preview:", raw_text[:200].replace("\n", " ") + "...")

# Split text into smaller chunks for processing
print("Splitting text into chunks with smarter splitter...")
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=700,  # Larger chunks on sentence/paragraph boundaries
    chunk_overlap=100,  # Maintain more context
)
docs = text_splitter.split_text(raw_text)

# Debug: show preview of the first split chunk
print("First chunk preview:", docs[0][:150].replace("\n", " ") + "...")

# Convert text chunks into Document objects
documents = [Document(page_content=chunk) for chunk in docs]
print(f"Created {len(documents)} document chunks")

# Create embeddings using HuggingFace's free sentence transformer model
print("Creating embeddings...")
embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-mpnet-base-v2", model_kwargs={"device": "cpu"}
)

# Debug: print embedding dimension
vector_dim = embedding._client.get_sentence_embedding_dimension()
print(f"Embedding model loaded (dimension = {vector_dim})")

# Debug: preview embedding of first chunk
sample_emb = embedding.embed_documents([docs[0]])[0]
print("First embedding (10 dims):", [round(x, 4) for x in sample_emb[:10]], "...")

# Store embeddings in Chroma vector database
vectorstore = Chroma.from_documents(documents, embedding)

# Create a retriever to find relevant chunks
retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 6, "score_threshold": 0.1},
)
print("Retriever set to similarity_score_threshold with k=6 and threshold=0.1")
print("Retriever configured with k=6 and score_threshold=0.1")

# Set up Claude for the LLM
llm = ChatAnthropic(
    model="claude-3-haiku-20240307",  # Using Haiku for cost efficiency
    temperature=0.7,
    max_tokens=1024,
)

# Set up the QA chain with retrieval
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    chain_type="stuff",  # Stuff all retrieved docs into context
)

# Interactive question-answering loop
print("\n✅ RAG system ready with Claude!")
print("Ask questions about Clockworks from FlyFF (type 'exit' to quit):\n")

while True:
    # Get user input
    query = input("You: ")

    # Check if user wants to exit
    if query.lower() == "exit":
        print("Goodbye!")
        break

    # Process the query through the RAG pipeline
    try:
        result = qa_chain.invoke({"query": query})
        print(f"\nClaude: {result['result']}\n")
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Make sure your ANTHROPIC_API_KEY is set correctly in .env file\n")
