'use client';

import { ArticleResponse } from '@/lib/types';
import { useDocumentActions } from '@/hooks/useDocumentActions';

interface ArticleDisplayProps {
  article: ArticleResponse;
  briefData?: {
    keywords: string;
    contentType: string;
    tone: string;
    targetAudience: string;
  };
}

export default function ArticleDisplay({ article, briefData }: ArticleDisplayProps) {
  const { copied, handleCopy, handleDownload } = useDocumentActions(
    article.content,
    article.title
  );


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Generated Article
          </h2>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{article.word_count} words</span>
            <span>{article.sections} sections</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            Download
          </button>
        </div>
      </div>

      <div className="prose max-w-none">
        <div className="bg-gray-50 rounded-lg p-6 border">
          <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
            {article.content}
          </pre>
        </div>
      </div>
    </div>
  );
}
