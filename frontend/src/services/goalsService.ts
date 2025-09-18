import { apiGet, apiPost, apiPut } from '@/lib/api';
import { Goal, ApiResponse } from '@/types';

export const goalsService = {
  // Get all goals
  getAll: (): Promise<ApiResponse<Goal[]>> => {
    return apiGet<Goal[]>('/goals');
  },

  // Get goal by ID
  getById: (id: number): Promise<ApiResponse<Goal>> => {
    return apiGet<Goal>(`/goals/${id}`);
  },

  // Create new goal
  create: (goal: Omit<Goal, 'id'>): Promise<ApiResponse<Goal>> => {
    return apiPost<Goal>('/goals', goal);
  },

  // Update goal
  update: (id: number, goal: Partial<Goal>): Promise<ApiResponse<Goal>> => {
    return apiPut<Goal>(`/goals/${id}`, goal);
  },

  // Get goals KPIs
  getKPIs: (): Promise<ApiResponse<{
    totalSavings: number;
    averageAchievement: number;
    goalsAchieved: number;
    totalGoals: number;
  }>> => {
    return apiGet('/goals/kpis');
  },

  // Generate savings report
  generateSavingsReport: (contractId?: number): Promise<ApiResponse<{ url: string }>> => {
    return apiPost('/goals/savings-report', { contract_id: contractId });
  },

  // Configure goals for contract
  configureGoals: (contractId: number, targetReduction: number): Promise<ApiResponse<Goal>> => {
    return apiPost<Goal>('/goals/configure', { contract_id: contractId, target_reduction: targetReduction });
  }
};