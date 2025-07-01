'use client';

import { useArticleHistory } from '@/hooks/useArticleHistory';
import HistoryArticleItem from './HistoryArticleItem';

export default function History() {
  const {
    articles,
    loading,
    error,
    selectedArticle,
    toggleArticle
  } = useArticleHistory();

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
            <HistoryArticleItem
              key={article.id}
              article={article}
              isSelected={selectedArticle?.id === article.id}
              onToggle={() => toggleArticle(article)}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}