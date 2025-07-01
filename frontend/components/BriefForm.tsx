'use client';

import { BriefResponse, BriefRequest } from '@/lib/types';
import { useBriefForm } from '@/hooks/useBriefForm';

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
  const { formData, updateField, submitForm } = useBriefForm();

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
