export interface BriefRequest {
  keyword: string
  content_type: 'blog' | 'article' | 'guide'
  tone: 'professional' | 'casual' | 'technical'
  target_audience: string
  word_count: number
}

export interface OutlineItem {
  heading: string
  subpoints: string[]
}

export interface Recommendations {
  tone: string
  style: string
  length: number
}

export interface BriefResponse {
  title: string
  meta_description: string
  outline: OutlineItem[]
  key_points: string[]
  recommendations: Recommendations
}