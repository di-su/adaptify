import { useState } from 'react';
import type { BriefResponse, ArticleResponse } from '@/lib/types';

export const useContentGeneration = () => {
  const [brief, setBrief] = useState<BriefResponse | null>(null);
  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefFormData, setBriefFormData] = useState<any>(null);

  const handleBriefGenerated = (newBrief: BriefResponse) => {
    setBrief(newBrief);
    setError(null);
  };

  const handleFormDataChange = (data: any) => {
    setBriefFormData(data);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setBrief(null);
  };

  const handleArticleGenerated = async (newArticle: ArticleResponse) => {
    setArticle(newArticle);
    
    // Auto-save to Firebase
    if (briefFormData) {
      try {
        const { saveArticle } = await import('@/lib/articleService');
        await saveArticle({
          title: newArticle.title,
          content: newArticle.content,
          keywords: briefFormData.keyword,
          contentType: briefFormData.content_type,
          tone: briefFormData.tone,
          targetAudience: briefFormData.target_audience
        });
      } catch (error) {
        console.error('Failed to save article:', error);
      }
    }
  };

  const resetContent = () => {
    setBrief(null);
    setArticle(null);
    setError(null);
  };

  return {
    brief,
    article,
    loading,
    error,
    briefFormData,
    handleBriefGenerated,
    handleFormDataChange,
    handleError,
    handleArticleGenerated,
    setLoading,
    resetContent
  };
};