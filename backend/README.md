# Backend - Content Brief Generator API

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create `.env` file:

```bash
cp .env.example .env
```

4. Add your Anthropic API key to `.env`:

```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

5. Run the server:

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Visit http://localhost:8000/docs for interactive API documentation.
