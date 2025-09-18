import { apiGet } from '@/lib/api';
import { Analytics, ApiResponse } from '@/types';

export const analyticsService = {
  // Get all analytics data
  getAll: (): Promise<ApiResponse<Analytics>> => {
    return apiGet<Analytics>('/analytics');
  },

  // Get ROI metrics
  getROI: (period?: string): Promise<ApiResponse<{ roi: number; trend: string }>> => {
    return apiGet('/analytics/roi', { period });
  },

  // Get cost evolution
  getCostEvolution: (months: number = 6): Promise<ApiResponse<Array<{ month: string; value: number }>>> => {
    return apiGet('/analytics/cost-evolution', { months });
  },

  // Get supplier performance
  getSupplierPerformance: (): Promise<ApiResponse<Array<{ name: string; score: number; orders: number; savings: number }>>> => {
    return apiGet('/analytics/supplier-performance');
  },

  // Get insights
  getInsights: (): Promise<ApiResponse<{
    positive: string[];
    attention: string[];
    recommendations: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }>;
  }>> => {
    return apiGet('/analytics/insights');
  },

  // Get quote time metrics
  getQuoteMetrics: (): Promise<ApiResponse<{
    averageTime: number;
    trend: string;
    bySupplier: Array<{ supplier: string; averageTime: number }>;
  }>> => {
    return apiGet('/analytics/quote-metrics');
  },

  // Export analytics data
  exportData: (format: 'pdf' | 'excel' = 'excel'): Promise<ApiResponse<{ url: string }>> => {
    return apiGet('/analytics/export', { format });
  }
};