import os
from dotenv import load_dotenv

# Set tokenizers parallelism to avoid fork warnings
os.environ["TOKENIZERS_PARALLELISM"] = "false"
from langchain_anthropic import ChatAnthropic
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter
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

# Split text into smaller chunks for processing
print("Splitting text into chunks...")
text_splitter = CharacterTextSplitter(
    chunk_size=500,  # Size of each chunk in characters
    chunk_overlap=50,  # Overlap between chunks to maintain context
)
docs = text_splitter.split_text(raw_text)

# Convert text chunks into Document objects
documents = [Document(page_content=chunk) for chunk in docs]
print(f"Created {len(documents)} document chunks")

# Create embeddings using HuggingFace's free sentence transformer model
print("Creating embeddings...")
embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-mpnet-base-v2", model_kwargs={"device": "cpu"}
)

# Store embeddings in Chroma vector database
vectorstore = Chroma.from_documents(documents, embedding)

# Create a retriever to find relevant chunks
retriever = vectorstore.as_retriever()

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
