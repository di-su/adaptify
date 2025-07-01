import { useState, useEffect } from 'react';
import { getArticles, Article } from '@/lib/articleService';

export const useArticleHistory = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedArticles = await getArticles();
      setArticles(fetchedArticles);
    } catch (err) {
      setError('Failed to load articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleArticle = (article: Article) => {
    setSelectedArticle(selectedArticle?.id === article.id ? null : article);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return {
    articles,
    loading,
    error,
    selectedArticle,
    toggleArticle,
    refreshArticles: loadArticles
  };
};