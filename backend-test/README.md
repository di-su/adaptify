# RAG Demo - FlyFF Clockworks

A simple Retrieval-Augmented Generation (RAG) system that answers questions about FlyFF Clockworks using Claude and a local vector database.

## Features

- FastAPI backend with RAG search endpoint
- Simple vanilla JavaScript frontend
- Vector search using Chroma and HuggingFace embeddings
- Claude (Anthropic) for answer generation

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with your Anthropic API key:
```
ANTHROPIC_API_KEY=your_api_key_here
```

3. Start the server:
```bash
uvicorn app:app --reload
```

4. Open your browser and go to:
```
http://localhost:8000/static/index.html
```

## Usage

- Enter questions about FlyFF Clockworks in the input field
- Click "Ask" or press Enter
- View the AI-generated answer and source documents with similarity scores

## API Endpoint

`POST /rag/search`
```json
{
  "query": "Who is Clockworks in FlyFF?",
  "top_k": 5,
  "temperature": 0.2
}
```

Returns answer text and source documents with similarity scores.