'use client';

import { useState } from 'react';
import { BriefResponse, ArticleResponse, ArticleRequest } from '@/lib/types';
import ArticleDisplay from './ArticleDisplay';

interface BriefDisplayProps {
  brief: BriefResponse;
  onArticleGenerated?: (article: ArticleResponse) => void;
  onError?: (error: string) => void;
}

export default function BriefDisplay({ brief, onArticleGenerated, onError }: BriefDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );
  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

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

  const generateArticle = async () => {
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
        'http://localhost:8000/api/generate-article',
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
      setArticle(articleData);
      if (onArticleGenerated) {
        onArticleGenerated(articleData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate article';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Copy Brief
          </button>
          <button
            onClick={generateArticle}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {isGenerating ? 'Generating Article...' : 'Generate Article →'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Title</h3>
          <p className="text-gray-800">{brief.title}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Meta Description</h3>
          <p className="text-gray-600 italic">{brief.meta_description}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Outline</h3>
          <div className="space-y-3">
            {brief.outline.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-md">
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-medium">{section.heading}</span>
                  <span className="text-gray-400">
                    {expandedSections.has(index) ? '−' : '+'}
                  </span>
                </button>
                {expandedSections.has(index) && (
                  <div className="px-4 pb-3">
                    <ul className="list-disc list-inside space-y-1">
                      {section.subpoints.map((point, idx) => (
                        <li key={idx} className="text-gray-600">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Key Points</h3>
          <ul className="list-disc list-inside space-y-1">
            {brief.key_points.map((point, index) => (
              <li key={index} className="text-gray-600">
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
          <div className="bg-gray-50 rounded-md p-4">
            <p>
              <strong>Tone:</strong> {brief.recommendations.tone}
            </p>
            <p>
              <strong>Style:</strong> {brief.recommendations.style}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
