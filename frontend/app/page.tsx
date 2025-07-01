'use client';

import BriefForm from '@/components/BriefForm';
import BriefDisplay from '@/components/BriefDisplay';
import ArticleDisplay from '@/components/ArticleDisplay';
import History from '@/components/History';
import { useStageNavigation } from '@/hooks/useStageNavigation';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import type { BriefResponse, ArticleResponse } from '@/lib/types';
import type { Stage } from '@/hooks/useStageNavigation';

export default function Home() {
  const { activeTab, setActiveTab } = useTabNavigation();
  const { stage, goToStage, resetFlow, setStage } = useStageNavigation();
  const {
    brief,
    article,
    loading,
    error,
    briefFormData,
    handleBriefGenerated,
    handleFormDataChange,
    handleError,
    handleArticleGenerated,
    setLoading,
    resetContent
  } = useContentGeneration();

  const handleBriefGeneratedWithStage = (newBrief: BriefResponse) => {
    handleBriefGenerated(newBrief);
    setStage('brief');
  };

  const handleArticleGeneratedWithStage = async (newArticle: ArticleResponse) => {
    await handleArticleGenerated(newArticle);
    setStage('article');
  };

  const goToStageWithError = (newStage: Stage) => {
    goToStage(newStage);
    if (error) handleError('');
  };

  const resetAll = () => {
    resetFlow();
    resetContent();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            AI-Powered Content Generation
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create SEO-optimized content briefs and articles in minutes with our
            advanced AI technology.
          </p>
        </div>

        {/* Tab Navigation - Show on form stage (not loading) or after article is generated */}
        {((stage === 'form' && !loading) || stage === 'article') && (
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === 'generator'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>History</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Progress Steps - Only show for generator tab */}
        {activeTab === 'generator' && (
          <div className="flex justify-center items-center space-x-4 mb-12">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                stage === 'form'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : stage === 'brief' || stage === 'article'
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {stage === 'brief' || stage === 'article' ? '✓' : '1'}
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              Generate Brief
            </span>
          </div>

          <div
            className={`w-16 h-1 rounded-full transition-all duration-500 ${
              stage === 'brief' || stage === 'article'
                ? 'bg-indigo-200'
                : 'bg-gray-200'
            }`}
          ></div>

          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                stage === 'brief'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : stage === 'article'
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {stage === 'article' ? '✓' : '2'}
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              Review Brief
            </span>
          </div>

          <div
            className={`w-16 h-1 rounded-full transition-all duration-500 ${
              stage === 'article' ? 'bg-indigo-200' : 'bg-gray-200'
            }`}
          ></div>

          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                stage === 'article'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              3
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              Generate Article
            </span>
          </div>
        </div>
        )}

        {/* Error Display - Only show for generator tab */}
        {activeTab === 'generator' && error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl mb-8 text-center font-medium">
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

        {/* Tab Content */}
        {activeTab === 'history' ? (
          <History />
        ) : (
          <div className="card p-8 lg:p-10">
          {stage === 'form' && (
            <div>
              <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">
                Generate Your Content Brief
              </h2>
              <p className="text-center text-gray-600 mb-2">
                Enter your target keyword and preferences to create an
                AI-powered content strategy
              </p>
              <p className="text-center text-sm text-gray-500 mb-8">
                ⏱️ Generation may take up to 60 seconds
              </p>
              <BriefForm
                onBriefGenerated={handleBriefGeneratedWithStage}
                onError={handleError}
                loading={loading}
                setLoading={setLoading}
                onFormDataChange={handleFormDataChange}
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
                  <p className="text-gray-600 mt-1">
                    Review and generate a full article from this brief
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => goToStageWithError('form')}
                    className="btn-secondary text-sm"
                  >
                    ← Edit Brief
                  </button>
                  <button
                    onClick={resetAll}
                    className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                  >
                    Start Over
                  </button>
                </div>
              </div>
              <BriefDisplay
                brief={brief}
                onArticleGenerated={handleArticleGeneratedWithStage}
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
                  <p className="text-gray-600 mt-1">
                    Ready to publish • {article.word_count} words •{' '}
                    {article.sections} sections
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => goToStageWithError('brief')}
                    className="btn-secondary text-sm"
                  >
                    ← Back to Brief
                  </button>
                  <button onClick={resetAll} className="btn-primary text-sm">
                    Create New Content
                  </button>
                </div>
              </div>

              <ArticleDisplay article={article} />
            </div>
          )}
        </div>
        )}
      </div>
    </main>
  );
}
