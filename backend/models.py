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