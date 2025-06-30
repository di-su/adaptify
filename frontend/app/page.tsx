'use client';

import { useState } from 'react';
import BriefForm from '@/components/BriefForm';
import BriefDisplay from '@/components/BriefDisplay';
import { BriefResponse, ArticleResponse } from '@/lib/types';

type Stage = 'form' | 'brief' | 'article';

export default function Home() {
  const [stage, setStage] = useState<Stage>('form');
  const [brief, setBrief] = useState<BriefResponse | null>(null);
  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBriefGenerated = (newBrief: BriefResponse) => {
    setBrief(newBrief);
    setError(null);
    setStage('brief');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setBrief(null);
  };

  const handleArticleGenerated = (newArticle: ArticleResponse) => {
    setArticle(newArticle);
    setStage('article');
  };

  const goToStage = (newStage: Stage) => {
    setStage(newStage);
    setError(null);
  };

  const resetFlow = () => {
    setStage('form');
    setBrief(null);
    setArticle(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with Progress */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            AI Content Generator
          </h1>
          
          {/* Progress Steps */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stage === 'form' ? 'bg-blue-600 text-white' : 
                (stage === 'brief' || stage === 'article') ? 'bg-green-500 text-white' : 
                'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Generate Brief</span>
            </div>
            
            <div className={`w-8 h-0.5 ${
              stage === 'brief' || stage === 'article' ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stage === 'brief' ? 'bg-blue-600 text-white' : 
                stage === 'article' ? 'bg-green-500 text-white' : 
                'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Review Brief</span>
            </div>
            
            <div className={`w-8 h-0.5 ${
              stage === 'article' ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stage === 'article' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Generate Article</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Stage Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {stage === 'form' && (
            <div>
              <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                Step 1: Generate Content Brief
              </h2>
              <BriefForm
                onBriefGenerated={handleBriefGenerated}
                onError={handleError}
                loading={loading}
                setLoading={setLoading}
              />
            </div>
          )}

          {stage === 'brief' && brief && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Step 2: Review Your Brief
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => goToStage('form')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Back to Form
                  </button>
                  <button
                    onClick={resetFlow}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </div>
              <BriefDisplay 
                brief={brief} 
                onArticleGenerated={handleArticleGenerated}
                onError={handleError}
              />
            </div>
          )}

          {stage === 'article' && article && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Step 3: Your Generated Article
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => goToStage('brief')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Back to Brief
                  </button>
                  <button
                    onClick={resetFlow}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create New Content
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{article.title}</h3>
                  <div className="text-sm text-gray-500">
                    {article.word_count} words • {article.sections} sections
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                    {article.content}
                  </pre>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(article.content)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Copy Article
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([article.content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${article.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Download Article
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
