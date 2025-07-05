from pydantic import BaseModel
from typing import List


class OutlineItem(BaseModel):
    heading: str
    subpoints: List[str]


class Recommendations(BaseModel):
    tone: str
    style: str
    target_audience: str = "general audience"


class BriefRequest(BaseModel):
    keyword: str
    content_type: str = "blog"
    tone: str = "professional"
    target_audience: str = "general audience"
    scraped_content: str = ""


class BriefResponse(BaseModel):
    title: str
    meta_description: str
    outline: List[OutlineItem]
    key_points: List[str]
    recommendations: Recommendations
    scraped_content: str = ""


class ArticleRequest(BaseModel):
    title: str
    meta_description: str
    outline: List[OutlineItem]
    key_points: List[str]
    recommendations: Recommendations
    scraped_content: str = ""


class ArticleResponse(BaseModel):
    title: str
    content: str
    word_count: int
    sections: int


class UrlAnalysisRequest(BaseModel):
    url: str


class UrlAnalysisResponse(BaseModel):
    keyword: str
    target_audience: str
    content_type: str = "blog"
    tone: str = "casual"
    scraped_content: str = ""
