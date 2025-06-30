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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-semibold text-gray-900">Adaptify Content</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">About</a>
              <button className="btn-primary">Get Started</button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            AI-Powered Content Generation
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create SEO-optimized content briefs and articles in minutes with our advanced AI technology.
          </p>
          
        </div>
        
        {/* Progress Steps */}
        <div className="flex justify-center items-center space-x-4 mb-12">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
              stage === 'form' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 
              (stage === 'brief' || stage === 'article') ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200' : 
              'bg-gray-100 text-gray-400'
            }`}>
              {(stage === 'brief' || stage === 'article') ? '✓' : '1'}
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">Generate Brief</span>
          </div>
          
          <div className={`w-16 h-1 rounded-full transition-all duration-500 ${
            stage === 'brief' || stage === 'article' ? 'bg-indigo-200' : 'bg-gray-200'
          }`}></div>
          
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
              stage === 'brief' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 
              stage === 'article' ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200' : 
              'bg-gray-100 text-gray-400'
            }`}>
              {stage === 'article' ? '✓' : '2'}
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">Review Brief</span>
          </div>
          
          <div className={`w-16 h-1 rounded-full transition-all duration-500 ${
            stage === 'article' ? 'bg-indigo-200' : 'bg-gray-200'
          }`}></div>
          
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
              stage === 'article' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-400'
            }`}>
              3
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">Generate Article</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl mb-8 text-center font-medium">
            <span className="inline-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </span>
          </div>
        )}

        {/* Stage Content */}
        <div className="card p-8 lg:p-10">
          {stage === 'form' && (
            <div>
              <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
                Generate Your Content Brief
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Enter your target keyword and preferences to create an AI-powered content strategy
              </p>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Your Content Brief
                  </h2>
                  <p className="text-gray-600 mt-1">Review and generate a full article from this brief</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => goToStage('form')}
                    className="btn-secondary text-sm"
                  >
                    ← Edit Brief
                  </button>
                  <button
                    onClick={resetFlow}
                    className="text-gray-500 hover:text-gray-700 font-medium text-sm"
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Your Generated Article
                  </h2>
                  <p className="text-gray-600 mt-1">Ready to publish • {article.word_count} words • {article.sections} sections</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => goToStage('brief')}
                    className="btn-secondary text-sm"
                  >
                    ← Back to Brief
                  </button>
                  <button
                    onClick={resetFlow}
                    className="btn-primary text-sm"
                  >
                    Create New Content
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                <div className="bg-white border-b border-gray-100 px-6 py-4">
                  <h3 className="text-xl font-bold text-gray-900">{article.title}</h3>
                </div>
                
                <div className="p-6">
                  <div className="prose prose-lg max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed bg-transparent border-0 p-0">
{article.content}
                    </pre>
                  </div>
                </div>
                
                <div className="bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(article.content);
                      // You could add a toast notification here
                    }}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
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
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
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
