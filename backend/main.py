from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from anthropic_service import AnthropicService

load_dotenv()

app = FastAPI(title="Content Brief Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://frontend-jx87fkbze-disus-projects-1bcda6b3.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

anthropic_service = AnthropicService()


class BriefRequest(BaseModel):
    keyword: str
    content_type: str = "blog"
    tone: str = "professional"
    target_audience: str = "general audience"


class OutlineItem(BaseModel):
    heading: str
    subpoints: List[str]


class Recommendations(BaseModel):
    tone: str
    style: str


class BriefResponse(BaseModel):
    title: str
    meta_description: str
    outline: List[OutlineItem]
    key_points: List[str]
    recommendations: Recommendations


class ArticleRequest(BaseModel):
    title: str
    meta_description: str
    outline: List[OutlineItem]
    key_points: List[str]
    recommendations: Recommendations


class ArticleResponse(BaseModel):
    title: str
    content: str
    word_count: int
    sections: int


@app.get("/")
async def root():
    return {"message": "Content Brief Generator API"}


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
        brief_data = {
            "title": request.title,
            "meta_description": request.meta_description,
            "outline": [
                {"heading": item.heading, "subpoints": item.subpoints}
                for item in request.outline
            ],
            "key_points": request.key_points,
            "recommendations": {
                "tone": request.recommendations.tone,
                "style": request.recommendations.style,
                "target_audience": "general audience",
            },
        }

        article = await anthropic_service.generate_article_from_brief(brief_data)
        return article
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
