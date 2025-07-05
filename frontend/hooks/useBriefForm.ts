import { useState } from 'react';
import axios from 'axios';
import type { BriefRequest, BriefResponse, UrlAnalysisRequest, UrlAnalysisResponse } from '@/lib/types';

export const useBriefForm = () => {
  const initialFormData: BriefRequest = {
    keyword: '',
    content_type: 'blog',
    tone: 'professional',
    target_audience: '',
  };
  
  const [formData, setFormData] = useState<BriefRequest>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof BriefRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submitForm = async (skipValidation = false): Promise<{ data?: BriefResponse; error?: string }> => {
    if (!skipValidation && !formData.keyword.trim()) {
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
    setFormData(initialFormData);
  };

  const analyzeUrl = async (url: string): Promise<{ error?: string; data?: UrlAnalysisResponse }> => {
    try {
      const response = await axios.post<UrlAnalysisResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analyze-url`,
        { url } as UrlAnalysisRequest
      );

      // Update form with analyzed data
      setFormData({
        keyword: response.data.keyword,
        target_audience: response.data.target_audience,
        content_type: response.data.content_type,
        tone: response.data.tone,
      });

      return { data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { error: error.response?.data?.detail || 'Failed to analyze URL' };
      } else {
        return { error: 'An unexpected error occurred' };
      }
    }
  };

  const analyzeUrlAndSubmit = async (url: string): Promise<{ data?: BriefResponse; error?: string }> => {
    try {
      const response = await axios.post<UrlAnalysisResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analyze-url`,
        { url } as UrlAnalysisRequest
      );

      // Create the form data for submission
      const urlFormData: BriefRequest = {
        keyword: response.data.keyword,
        target_audience: response.data.target_audience,
        content_type: response.data.content_type,
        tone: response.data.tone,
      };

      // Update the form state
      setFormData(urlFormData);

      setIsSubmitting(true);

      // Submit the brief request directly with the analyzed data
      const briefResponse = await axios.post<BriefResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/generate-brief`,
        urlFormData
      );

      return { data: briefResponse.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { error: error.response?.data?.detail || 'Failed to analyze URL and generate brief' };
      } else {
        return { error: 'An unexpected error occurred' };
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    updateField,
    submitForm,
    resetForm,
    isSubmitting,
    analyzeUrl,
    analyzeUrlAndSubmit
  };
};