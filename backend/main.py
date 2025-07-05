from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from langchain_service import LangChainService
from models import BriefRequest, BriefResponse, ArticleRequest, ArticleResponse, UrlAnalysisRequest, UrlAnalysisResponse
from url_scraper import url_scraper
from content_analyzer import content_analyzer
from rag_service import rag_service

load_dotenv()

app = FastAPI(title="Content Brief Generator API")

# Configure CORS - allow all origins by default
allow_all_cors = os.getenv("ALLOW_ALL_CORS", "true").lower() == "true"

if allow_all_cors:
    # Allow all origins (less secure but flexible)
    cors_config = {
        "allow_origins": ["*"],
        "allow_credentials": False,
        "allow_methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
    }
else:
    # Specific origins for security
    cors_origins = [
        "http://localhost:3000",  # Local development
        "http://127.0.0.1:3000",  # Local development alternative
    ]
    
    # Add production origins from environment variables
    production_origin = os.getenv("FRONTEND_URL")
    if production_origin:
        cors_origins.append(production_origin)
    
    # Support for multiple production origins
    additional_origins = os.getenv("CORS_ORIGINS")
    if additional_origins:
        cors_origins.extend(additional_origins.split(","))
    
    cors_config = {
        "allow_origins": cors_origins,
        "allow_credentials": False,
        "allow_methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }

app.add_middleware(CORSMiddleware, **cors_config)

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
            scraped_content=request.scraped_content,
        )
        return brief
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-article", response_model=ArticleResponse)
async def generate_article(request: ArticleRequest):
    try:
        brief_data = request.dict()
        article = await langchain_service.generate_article_from_brief(brief_data)
        return article
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-url", response_model=UrlAnalysisResponse)
async def analyze_url(request: UrlAnalysisRequest):
    try:
        # Scrape URL content
        content = url_scraper.scrape_url(request.url)
        
        # Process scraped content into RAG system
        rag_service.process_scraped_content(request.url, content)
        
        # Analyze content to extract keyword and audience
        analysis_result = await content_analyzer.analyze_content(content)
        
        # Prepare response
        response = UrlAnalysisResponse(
            keyword=analysis_result["keyword"],
            target_audience=analysis_result["target_audience"],
            content_type="blog",
            tone="casual",
            scraped_content=content
        )
        
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze URL: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
