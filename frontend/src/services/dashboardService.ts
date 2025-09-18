import { apiGet } from '@/lib/api';
import { KPI, Activity, ApiResponse } from '@/types';

export const dashboardService = {
  // Get main KPIs
  getKPIs: (): Promise<ApiResponse<{
    contractBalance: number;
    realizedSavings: number;
    reductionTarget: number;
    pendingPurchases: number;
  }>> => {
    return apiGet('/dashboard/kpis');
  },

  // Get active contracts summary
  getActiveContracts: (): Promise<ApiResponse<Array<{
    id: number;
    name: string;
    progress: number;
    budget: number;
    spent: number;
    status: string;
  }>>> => {
    return apiGet('/dashboard/active-contracts');
  },

  // Get recent activities
  getRecentActivities: (limit: number = 10): Promise<ApiResponse<Activity[]>> => {
    return apiGet<Activity[]>('/dashboard/activities', { limit });
  },

  // Get alerts
  getAlerts: (): Promise<ApiResponse<Array<{
    id: number;
    type: 'budget' | 'approval' | 'deadline' | 'nf' | 'sync';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    contractId?: number;
    actionUrl?: string;
  }>>> => {
    return apiGet('/dashboard/alerts');
  },

  // Generate dashboard report
  generateReport: (format: 'pdf' | 'excel' = 'pdf'): Promise<ApiResponse<{ url: string }>> => {
    return apiGet('/dashboard/report', { format });
  },

  // Get analytics overview
  getAnalytics: (): Promise<ApiResponse<{
    totalContracts: number;
    totalValue: number;
    totalSpent: number;
    activeSuppliers: number;
    pendingNFs: number;
    lastSyncDate?: string;
  }>> => {
    return apiGet('/dashboard/analytics');
  }
};