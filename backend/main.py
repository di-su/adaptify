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
    allow_origins=["http://localhost:3000"],
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
    word_count: int = 1500

class OutlineItem(BaseModel):
    heading: str
    subpoints: List[str]

class Recommendations(BaseModel):
    tone: str
    style: str
    length: int

class BriefResponse(BaseModel):
    title: str
    meta_description: str
    outline: List[OutlineItem]
    key_points: List[str]
    recommendations: Recommendations

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
            word_count=request.word_count
        )
        return brief
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)