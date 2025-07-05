'use client';

import { BriefResponse, BriefRequest } from '@/lib/types';
import { useBriefForm } from '@/hooks/useBriefForm';
import { useState } from 'react';

interface BriefFormProps {
  onBriefGenerated: (brief: BriefResponse) => void;
  onError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onFormDataChange?: (data: BriefRequest) => void;
}

export default function BriefForm({
  onBriefGenerated,
  onError,
  loading,
  setLoading,
  onFormDataChange,
}: BriefFormProps) {
  const { formData, updateField, submitForm, analyzeUrl, resetForm, analyzeUrlAndSubmit } = useBriefForm();
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await submitForm();
    
    if (result.error) {
      onError(result.error);
    } else if (result.data) {
      onBriefGenerated(result.data);
      onFormDataChange?.(formData);
    }
    
    setLoading(false);
  };

  const handleUrlAnalysis = async () => {
    if (!urlInput.trim()) {
      onError('Please enter a URL');
      return;
    }

    setIsAnalyzing(true);
    setLoading(true);
    
    const result = await analyzeUrlAndSubmit(urlInput);
    
    if (result.error) {
      onError(result.error);
    } else if (result.data) {
      onBriefGenerated(result.data);
      onFormDataChange?.(formData);
    }
    
    setIsAnalyzing(false);
    setLoading(false);
  };

  // Manual form mode
  if (showManualForm) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <button
            onClick={() => {
              setShowManualForm(false);
              resetForm();
            }}
            type="button"
            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to URL Analysis
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Analyze a website instead of filling details manually
          </p>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="keyword"
            className="block text-sm font-semibold text-gray-900"
          >
            Target Keyword
            <span className="text-red-500 ml-1">*</span>
          </label>
          <p className="text-sm text-gray-600">
            Enter the main keyword or topic for your content
          </p>
          <input
            type="text"
            id="keyword"
            value={formData.keyword}
            onChange={e => updateField('keyword', e.target.value)}
            className="input-modern"
            placeholder="e.g., sustainable fashion, remote work tips"
            disabled={loading}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label
              htmlFor="content_type"
              className="block text-sm font-semibold text-gray-900"
            >
              Content Type
            </label>
            <select
              id="content_type"
              value={formData.content_type}
              onChange={e => updateField('content_type', e.target.value)}
              className="input-modern"
              disabled={loading}
            >
              <option value="blog">Blog Post</option>
              <option value="article">Article</option>
              <option value="guide">How-to Guide</option>
            </select>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="tone"
              className="block text-sm font-semibold text-gray-900"
            >
              Writing Tone
            </label>
            <select
              id="tone"
              value={formData.tone}
              onChange={e => updateField('tone', e.target.value)}
              className="input-modern"
              disabled={loading}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual & Friendly</option>
              <option value="technical">Technical</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="target_audience"
            className="block text-sm font-semibold text-gray-900"
          >
            Target Audience
            <span className="text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <p className="text-sm text-gray-600">
            Describe your ideal reader for more targeted content
          </p>
          <input
            type="text"
            id="target_audience"
            value={formData.target_audience}
            onChange={e => updateField('target_audience', e.target.value)}
            className="input-modern"
            placeholder="e.g., small business owners, fitness enthusiasts, tech professionals"
            disabled={loading}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                Generating Your Brief...
              </>
            ) : (
              <>
                Generate Content Brief
                <svg
                  className="w-5 h-5"
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
      </form>
    );
  }

  // Primary URL analysis mode
  return (
    <div className="space-y-8">
      {/* Main URL Analysis Section */}
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Analyze Any Website</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Enter a website URL and we'll automatically extract keywords, target audience, and generate a complete content brief
          </p>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          <div>
            <label htmlFor="url" className="block text-sm font-semibold text-gray-900 mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="input-modern"
              placeholder="https://example.com/article"
              disabled={loading || isAnalyzing}
              autoFocus
            />
          </div>

          <button
            onClick={handleUrlAnalysis}
            disabled={loading || isAnalyzing || !urlInput.trim()}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4"
          >
            {isAnalyzing || loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                {isAnalyzing ? 'Analyzing URL...' : 'Generating Brief...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Analyze & Generate Brief
              </>
            )}
          </button>

          <p className="text-sm text-gray-500 text-center">
            ✨ Powered by AI • Extract keywords, audience & generate brief in one click
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Manual Entry Option */}
      <div className="text-center">
        <button
          onClick={() => setShowManualForm(true)}
          className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Fill details manually instead
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Prefer to enter keyword, content type, and audience yourself?
        </p>
      </div>
    </div>
  );
}