'use client';

import { Article } from '@/lib/articleService';
import { useDocumentActions } from '@/hooks/useDocumentActions';

interface HistoryArticleItemProps {
  article: Article;
  isSelected: boolean;
  onToggle: () => void;
  formatDate: (timestamp: any) => string;
}

export default function HistoryArticleItem({
  article,
  isSelected,
  onToggle,
  formatDate
}: HistoryArticleItemProps) {
  const { copied, handleCopy, handleDownload } = useDocumentActions(
    article.content,
    article.title
  );

  return (
    <div
      key={article.id}
      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onToggle}
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
        {article.keywords && (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {article.keywords}
          </span>
        )}
        {article.contentType && (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
            {article.contentType}
          </span>
        )}
        {article.tone && (
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
            {article.tone}
          </span>
        )}
      </div>

      {isSelected && (
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Download
            </button>
          </div>
          <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {article.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}