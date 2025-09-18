import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Purchase, ApiResponse } from '@/types';

export const purchasesService = {
  // Get all purchases
  getAll: (contractId?: number): Promise<ApiResponse<Purchase[]>> => {
    const params = contractId ? { contract_id: contractId } : undefined;
    return apiGet<Purchase[]>('/purchases', params);
  },

  // Get purchase by ID
  getById: (id: number): Promise<ApiResponse<Purchase>> => {
    return apiGet<Purchase>(`/purchases/${id}`);
  },

  // Create new purchase
  create: (purchase: Omit<Purchase, 'id'>): Promise<ApiResponse<Purchase>> => {
    return apiPost<Purchase>('/purchases', purchase);
  },

  // Update purchase
  update: (id: number, purchase: Partial<Purchase>): Promise<ApiResponse<Purchase>> => {
    return apiPut<Purchase>(`/purchases/${id}`, purchase);
  },

  // Delete purchase
  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/purchases/${id}`);
  },

  // Get purchase KPIs
  getKPIs: (): Promise<ApiResponse<{
    totalPurchases: number;
    approvedPurchases: number;
    pendingQuotes: number;
    averageSavings: number;
  }>> => {
    return apiGet('/purchases/kpis');
  },

  // Approve purchase
  approve: (id: number): Promise<ApiResponse<Purchase>> => {
    return apiPut<Purchase>(`/purchases/${id}/approve`);
  },

  // Get quotations
  getQuotations: (purchaseId: number): Promise<ApiResponse<any[]>> => {
    return apiGet(`/purchases/${purchaseId}/quotations`);
  }
};