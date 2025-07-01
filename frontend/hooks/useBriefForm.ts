import { useState } from 'react';
import axios from 'axios';
import type { BriefRequest, BriefResponse } from '@/lib/types';

export const useBriefForm = () => {
  const [formData, setFormData] = useState<BriefRequest>({
    keyword: '',
    content_type: 'blog',
    tone: 'professional',
    target_audience: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof BriefRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submitForm = async (): Promise<{ data?: BriefResponse; error?: string }> => {
    if (!formData.keyword.trim()) {
      return { error: 'Please enter a keyword' };
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post<BriefResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/generate-brief`,
        formData
      );

      return { data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { error: error.response?.data?.detail || 'Failed to generate brief' };
      } else {
        return { error: 'An unexpected error occurred' };
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      keyword: '',
      content_type: 'blog',
      tone: 'professional',
      target_audience: '',
    });
  };

  return {
    formData,
    updateField,
    submitForm,
    resetForm,
    isSubmitting
  };
};