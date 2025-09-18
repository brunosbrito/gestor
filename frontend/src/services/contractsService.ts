import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Contract, ApiResponse } from '@/types';

export const contractsService = {
  // Get all contracts
  getAll: (): Promise<ApiResponse<Contract[]>> => {
    return apiGet<Contract[]>('/contracts');
  },

  // Get contract by ID
  getById: (id: number): Promise<ApiResponse<Contract>> => {
    return apiGet<Contract>(`/contracts/${id}`);
  },

  // Create new contract
  create: (contract: Omit<Contract, 'id'>): Promise<ApiResponse<Contract>> => {
    return apiPost<Contract>('/contracts', contract);
  },

  // Update contract
  update: (id: number, contract: Partial<Contract>): Promise<ApiResponse<Contract>> => {
    return apiPut<Contract>(`/contracts/${id}`, contract);
  },

  // Delete contract
  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/contracts/${id}`);
  },

  // Get contract KPIs
  getKPIs: (): Promise<ApiResponse<{
    totalValue: number;
    totalSpent: number;
    avgProgress: number;
    activeContracts: number;
  }>> => {
    return apiGet('/contracts/kpis');
  },

  // Update contract progress
  updateProgress: (id: number, progress: number): Promise<ApiResponse<Contract>> => {
    return apiPut<Contract>(`/contracts/${id}/progress`, { progress });
  }
};