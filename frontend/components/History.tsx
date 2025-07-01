'use client';

import { useState, useEffect } from 'react';
import { getArticles, Article } from '@/lib/articleService';

export default function History() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const fetchedArticles = await getArticles();
      setArticles(fetchedArticles);
    } catch (err) {
      setError('Failed to load articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    return timestamp?.toDate?.()?.toLocaleDateString() || 'Unknown date';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse text-center">Loading articles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Article History</h2>
        <span className="text-sm text-gray-600">{articles.length} articles</span>
      </div>

      {articles.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No articles saved yet. Generate an article to see it here!
        </div>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedArticle(selectedArticle?.id === article.id ? null : article)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {article.title}
                </h3>
                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                  {formatDate(article.createdAt)}
                </span>
              </div>
              
              <div className="flex gap-2 mb-2 text-xs">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {article.contentType}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  {article.tone}
                </span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {article.targetAudience}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                Keywords: {article.keywords}
              </p>

              {selectedArticle?.id === article.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                      {article.content}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}