'use client';

import { useState } from 'react';
import axios from 'axios';
import { BriefRequest, BriefResponse } from '@/lib/types';

interface BriefFormProps {
  onBriefGenerated: (brief: BriefResponse) => void;
  onError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default function BriefForm({
  onBriefGenerated,
  onError,
  loading,
  setLoading,
}: BriefFormProps) {
  const [formData, setFormData] = useState<BriefRequest>({
    keyword: '',
    content_type: 'blog',
    tone: 'professional',
    target_audience: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.keyword.trim()) {
      onError('Please enter a keyword');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post<BriefResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/generate-brief`,
        formData
      );

      onBriefGenerated(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        onError(error.response?.data?.detail || 'Failed to generate brief');
      } else {
        onError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Generate Content Brief</h2>

      <div className="mb-4">
        <label
          htmlFor="keyword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Keywords *
        </label>
        <input
          type="text"
          id="keyword"
          value={formData.keyword}
          onChange={e => setFormData({ ...formData, keyword: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., fasting, coffee"
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="content_type"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Content Type
        </label>
        <select
          id="content_type"
          value={formData.content_type}
          onChange={e =>
            setFormData({
              ...formData,
              content_type: e.target.value as BriefRequest['content_type'],
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="blog">Blog Post</option>
          <option value="article">Article</option>
          <option value="guide">Guide</option>
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="tone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tone
        </label>
        <select
          id="tone"
          value={formData.tone}
          onChange={e =>
            setFormData({
              ...formData,
              tone: e.target.value as BriefRequest['tone'],
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="technical">Technical</option>
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="target_audience"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Target Audience
        </label>
        <input
          type="text"
          id="target_audience"
          value={formData.target_audience}
          onChange={e =>
            setFormData({ ...formData, target_audience: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., health-conscious adults"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
      >
        {loading ? 'Generating...' : 'Generate Brief'}
      </button>
    </form>
  );
}
