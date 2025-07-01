import { useState } from 'react';
import type { BriefResponse, ArticleResponse, ArticleRequest } from '@/lib/types';

export const useArticleGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateArticle = async (brief: BriefResponse): Promise<ArticleResponse | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const articleRequest: ArticleRequest = {
        title: brief.title,
        meta_description: brief.meta_description,
        outline: brief.outline,
        key_points: brief.key_points,
        recommendations: brief.recommendations,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/generate-article`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(articleRequest),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const articleData: ArticleResponse = await response.json();
      return articleData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate article';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateArticle,
    isGenerating,
    error,
    setError
  };
};