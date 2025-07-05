export interface BriefRequest {
  keyword: string;
  content_type: 'blog' | 'article' | 'guide';
  tone: 'professional' | 'casual' | 'technical';
  target_audience: string;
  scraped_content?: string;
}

export interface OutlineItem {
  heading: string;
  subpoints: string[];
}

export interface Recommendations {
  tone: string;
  style: string;
}

export interface BriefResponse {
  title: string;
  meta_description: string;
  outline: OutlineItem[];
  key_points: string[];
  recommendations: Recommendations;
  scraped_content?: string;
}

export interface ArticleRequest {
  title: string;
  meta_description: string;
  outline: OutlineItem[];
  key_points: string[];
  recommendations: Recommendations;
  scraped_content?: string;
}

export interface ArticleResponse {
  title: string;
  content: string;
  word_count: number;
  sections: number;
}

export interface UrlAnalysisRequest {
  url: string;
}

export interface UrlAnalysisResponse {
  keyword: string;
  target_audience: string;
  content_type: 'blog' | 'article' | 'guide';
  tone: 'professional' | 'casual' | 'technical';
  scraped_content?: string;
}
