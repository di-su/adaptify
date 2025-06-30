from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from anthropic_service import AnthropicService
from models import BriefRequest, BriefResponse, ArticleRequest, ArticleResponse

load_dotenv()

app = FastAPI(title="Content Brief Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

anthropic_service = AnthropicService()


@app.get("/")
async def root():
    return {"message": "Content Brief Generator API"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Content Brief Generator API"}


@app.post("/api/generate-brief", response_model=BriefResponse)
async def generate_brief(request: BriefRequest):
    try:
        brief = await anthropic_service.generate_brief(
            keyword=request.keyword,
            content_type=request.content_type,
            tone=request.tone,
            target_audience=request.target_audience,
        )
        return brief
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-article", response_model=ArticleResponse)
async def generate_article(request: ArticleRequest):
    try:
        brief_data = request.dict()
        article = await anthropic_service.generate_article_from_brief(brief_data)
        return article
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
