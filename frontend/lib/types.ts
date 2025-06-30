export interface BriefRequest {
  keyword: string;
  content_type: 'blog' | 'article' | 'guide';
  tone: 'professional' | 'casual' | 'technical';
  target_audience: string;
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
}

export interface ArticleRequest {
  title: string;
  meta_description: string;
  outline: OutlineItem[];
  key_points: string[];
  recommendations: Recommendations;
}

export interface ArticleResponse {
  title: string;
  content: string;
  word_count: number;
  sections: number;
}
