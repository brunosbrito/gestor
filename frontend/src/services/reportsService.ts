import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Report, ApiResponse } from '@/types';

export const reportsService = {
  // Get all reports
  getAll: (): Promise<ApiResponse<Report[]>> => {
    return apiGet<Report[]>('/reports');
  },

  // Get report by ID
  getById: (id: number): Promise<ApiResponse<Report>> => {
    return apiGet<Report>(`/reports/${id}`);
  },

  // Generate analytical report
  generateAnalytical: (contractId?: number): Promise<ApiResponse<Report>> => {
    return apiPost<Report>('/reports/analytical', { contract_id: contractId });
  },

  // Generate account report
  generateAccount: (contractId?: number): Promise<ApiResponse<Report>> => {
    return apiPost<Report>('/reports/account', { contract_id: contractId });
  },

  // Export dashboard
  exportDashboard: (format: 'pdf' | 'excel' = 'pdf'): Promise<ApiResponse<Report>> => {
    return apiPost<Report>('/reports/dashboard', { format });
  },

  // Download report
  download: (id: number): Promise<ApiResponse<{ url: string }>> => {
    return apiGet(`/reports/${id}/download`);
  },

  // Delete report
  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/reports/${id}`);
  },

  // Get report status
  getStatus: (id: number): Promise<ApiResponse<{ status: string; progress: number }>> => {
    return apiGet(`/reports/${id}/status`);
  }
};