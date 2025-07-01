# Adaptify - Content Brief Generator

A full-stack application that generates content briefs using AI, built with FastAPI (Python) backend and Next.js (TypeScript) frontend.

## Project Structure

```
adaptify/
├── backend/          # FastAPI Python backend
├── frontend/         # Next.js TypeScript frontend  
├── package.json      # Root package with unified test scripts
└── README.md         # This file
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Anthropic API key

### Setup

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Add your ANTHROPIC_API_KEY to .env
   uvicorn main:app --reload
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Testing

Run tests from the root directory:

```bash
# Run all tests (frontend + backend)
npm test

# Run individual test suites
npm run test:frontend
npm run test:backend
```

## Features

- Generate content briefs from keywords
- Configurable content type, tone, and target audience
- FastAPI backend with automatic API documentation
- Modern React frontend with TypeScript
- Comprehensive test coverage

## Development

See individual README files in `backend/` and `frontend/` directories for detailed development instructions.