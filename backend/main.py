from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from langchain_service import LangChainService
from models import BriefRequest, BriefResponse, ArticleRequest, ArticleResponse, UrlAnalysisRequest, UrlAnalysisResponse
from url_scraper import url_scraper
from content_analyzer import content_analyzer

load_dotenv()

app = FastAPI(title="Content Brief Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LangChain service
langchain_service = LangChainService()


@app.get("/")
async def root():
    return {"message": "Content Brief Generator API"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Content Brief Generator API"}


@app.post("/api/generate-brief", response_model=BriefResponse)
async def generate_brief(request: BriefRequest):
    try:
        brief = await langchain_service.generate_brief(
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
        brief_data = request.model_dump()
        article = await langchain_service.generate_article_from_brief(brief_data)
        return article
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-url", response_model=UrlAnalysisResponse)
async def analyze_url(request: UrlAnalysisRequest):
    print(f"\n{'='*60}")
    print(f"🚀 NEW URL ANALYSIS REQUEST")
    print(f"📍 URL: {request.url}")
    print(f"{'='*60}")
    
    try:
        # Scrape URL content
        print(f"\n[Step 1/2] Scraping URL content...")
        content = url_scraper.scrape_url(request.url)
        
        # Analyze content to extract keyword and audience
        print(f"\n[Step 2/2] Analyzing content with AI...")
        analysis_result = await content_analyzer.analyze_content(content)
        
        # Prepare response
        response = UrlAnalysisResponse(
            keyword=analysis_result["keyword"],
            target_audience=analysis_result["target_audience"],
            content_type="blog",
            tone="casual"
        )
        
        print(f"\n🎉 URL ANALYSIS COMPLETE!")
        print(f"📋 Final Results:")
        print(f"   - Keyword: {response.keyword}")
        print(f"   - Target Audience: {response.target_audience}")
        print(f"   - Content Type: {response.content_type}")
        print(f"   - Tone: {response.tone}")
        print(f"{'='*60}\n")
        
        # Return response with defaults for content_type and tone
        return response
    except ValueError as e:
        print(f"\n❌ VALIDATION ERROR: {str(e)}")
        print(f"{'='*60}\n")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"\n❌ ANALYSIS FAILED: {str(e)}")
        print(f"{'='*60}\n")
        raise HTTPException(status_code=500, detail=f"Failed to analyze URL: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
