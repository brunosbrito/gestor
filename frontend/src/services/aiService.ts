import { apiGet, apiPost } from '@/lib/api';
import { ChatMessage, QuickAction, ApiResponse } from '@/types';

export const aiService = {
  // Send message to AI
  sendMessage: (message: string, context?: {
    contractId?: number;
    type?: 'analysis' | 'recommendation' | 'general';
  }): Promise<ApiResponse<ChatMessage>> => {
    return apiPost<ChatMessage>('/ai/chat', { message, context });
  },

  // Get chat history
  getChatHistory: (limit?: number): Promise<ApiResponse<ChatMessage[]>> => {
    return apiGet<ChatMessage[]>('/ai/chat/history', { limit });
  },

  // Clear chat history
  clearHistory: (): Promise<ApiResponse<void>> => {
    return apiPost('/ai/chat/clear');
  },

  // Get quick actions
  getQuickActions: (): Promise<ApiResponse<QuickAction[]>> => {
    return apiGet<QuickAction[]>('/ai/quick-actions');
  },

  // Execute quick action
  executeQuickAction: (actionId: string, context?: any): Promise<ApiResponse<ChatMessage>> => {
    return apiPost<ChatMessage>('/ai/quick-action', { action_id: actionId, context });
  },

  // Get AI analysis for contract
  analyzeContract: (contractId: number): Promise<ApiResponse<{
    analysis: string;
    recommendations: string[];
    risks: string[];
    opportunities: string[];
  }>> => {
    return apiPost('/ai/analyze/contract', { contract_id: contractId });
  },

  // Get AI insights for purchases
  analyzePurchases: (contractId?: number): Promise<ApiResponse<{
    insights: string[];
    costOptimization: string[];
    supplierRecommendations: string[];
  }>> => {
    return apiPost('/ai/analyze/purchases', { contract_id: contractId });
  },

  // Get budget alerts
  getBudgetAlerts: (): Promise<ApiResponse<Array<{
    type: 'warning' | 'critical' | 'info';
    title: string;
    description: string;
    contractId?: number;
    actionRequired?: boolean;
  }>>> => {
    return apiGet('/ai/alerts/budget');
  }
};