'use client';

import { BriefResponse, ArticleResponse } from '@/lib/types';
import { useExpandableSection } from '@/hooks/useExpandableSection';
import { useArticleGeneration } from '@/hooks/useArticleGeneration';

interface BriefDisplayProps {
  brief: BriefResponse;
  onArticleGenerated?: (article: ArticleResponse) => void;
  onError?: (error: string) => void;
}

export default function BriefDisplay({
  brief,
  onArticleGenerated,
  onError,
}: BriefDisplayProps) {
  const { toggleSection, isExpanded } = useExpandableSection(brief.outline.length);
  const { generateArticle, isGenerating, error } = useArticleGeneration();

  const copyToClipboard = () => {
    const briefText = formatBriefAsText(brief);
    navigator.clipboard
      .writeText(briefText)
      .then(() => alert('Brief copied to clipboard!'))
      .catch(() => alert('Failed to copy brief'));
  };

  const formatBriefAsText = (brief: BriefResponse): string => {
    let text = `Title: ${brief.title}\n\n`;
    text += `Meta Description: ${brief.meta_description}\n\n`;
    text += `Outline:\n`;

    brief.outline.forEach(section => {
      text += `\n${section.heading}\n`;
      section.subpoints.forEach(point => {
        text += `  - ${point}\n`;
      });
    });

    text += `\nKey Points:\n`;
    brief.key_points.forEach(point => {
      text += `- ${point}\n`;
    });

    text += `\nRecommendations:\n`;
    text += `- Tone: ${brief.recommendations.tone}\n`;
    text += `- Style: ${brief.recommendations.style}\n`;

    return text;
  };

  const handleGenerateArticle = async () => {
    const articleData = await generateArticle(brief);
    if (articleData && onArticleGenerated) {
      onArticleGenerated(articleData);
    } else if (error && onError) {
      onError(error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Ready to create your article?
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            Your brief is ready. Generate a full article or copy the brief for
            later use.
          </p>
          <p className="text-xs text-gray-500">
            ⏱️ Article generation may take up to 60 seconds
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Brief
          </button>
          <button
            onClick={handleGenerateArticle}
            disabled={isGenerating}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating Article...
              </>
            ) : (
              <>
                Generate Full Article
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Brief Content */}
      <div className="space-y-6">
        {/* Title & Meta */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Article Title
            </h3>
            <p className="text-lg font-semibold text-gray-900">{brief.title}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Meta Description
            </h3>
            <p className="text-gray-700">{brief.meta_description}</p>
          </div>
        </div>

        {/* Outline */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Content Outline
          </h3>
          <div className="space-y-3">
            {brief.outline.map((section, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-200 transition-colors"
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {section.heading}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded(index) ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isExpanded(index) && (
                  <div className="px-5 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                    <ul className="space-y-2">
                      {section.subpoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-500 mt-1">•</span>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key Points */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Key Points to Cover
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {brief.key_points.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg"
              >
                <svg
                  className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Writing Recommendations
          </h3>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-5 border border-purple-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Tone</p>
                <p className="text-gray-900 capitalize">
                  {brief.recommendations.tone}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Style
                </p>
                <p className="text-gray-900 capitalize">
                  {brief.recommendations.style}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl text-center font-medium">
          <span className="inline-flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
