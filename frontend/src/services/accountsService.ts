import { apiGet, apiPost } from '@/lib/api';
import { Account, ApiResponse, Activity } from '@/types';

export const accountsService = {
  // Get all accounts
  getAll: (): Promise<ApiResponse<Account[]>> => {
    return apiGet<Account[]>('/accounts');
  },

  // Get account by ID
  getById: (id: number): Promise<ApiResponse<Account>> => {
    return apiGet<Account>(`/accounts/${id}`);
  },

  // Get account KPIs
  getKPIs: (): Promise<ApiResponse<{
    totalBalance: number;
    totalSpent: number;
    totalValue: number;
    executionPercentage: number;
  }>> => {
    return apiGet('/accounts/kpis');
  },

  // Get account movements
  getMovements: (accountId: number, startDate?: string, endDate?: string): Promise<ApiResponse<Activity[]>> => {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    return apiGet<Activity[]>(`/accounts/${accountId}/movements`, params);
  },

  // Generate account statement
  generateStatement: (accountId: number, format: 'pdf' | 'excel' = 'pdf'): Promise<ApiResponse<{ url: string }>> => {
    return apiPost(`/accounts/${accountId}/statement`, { format });
  },

  // Export financial analysis
  exportAnalysis: (format: 'pdf' | 'excel' = 'pdf'): Promise<ApiResponse<{ url: string }>> => {
    return apiPost('/accounts/export-analysis', { format });
  }
};