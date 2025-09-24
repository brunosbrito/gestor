import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from '@/lib/api';
import {
  Contract,
  ContractDetails,
  ContractCreate,
  ApiResponse,
  BudgetItem,
  ContractType
} from '@/types';
import { Contact } from 'lucide-react';

export interface ContractListResponse {
  contracts: Contract[];
  total: number;
  page: number;
  per_page: number;
}

export const contractsService = {
  // Get all contracts
  getAll: async (): Promise<ApiResponse<{ contracts: Contract[] }>> => {
    try {
      // Backend returns ContractListResponse with contracts array
      const response = await apiGet<{ contracts: Contract[]; total: number; page: number; per_page: number }>('/contracts');
      return response;
    } catch (error) {
      console.error('❌ Error in contractsService.getAll:', error);
      throw error;
    }
  },

  // Get contract by ID
  getById: async (id: number): Promise<ApiResponse<ContractDetails>> => {
    return apiGet<ContractDetails>(`/contracts/${id}`);
  },

  // Create new contract with QQP_Cliente file
  create: async (contractData: ContractCreate, qqpFile: File): Promise<ApiResponse<Contract>> => {
    const formData = new FormData();

    // Add contract data fields
    formData.append('name', contractData.name);
    formData.append('client', contractData.client);
    formData.append('contractType', contractData.contractType);
    formData.append('startDate', contractData.startDate);
    if (contractData.description) {
      formData.append('description', contractData.description);
    }

    // Add QQP_Cliente file (obrigatório)
    formData.append('qqp_file', qqpFile);

    return apiUpload<Contract>('/contracts', formData);
  },

  // Update contract
  update: async (id: number, contractData: Partial<Contract>): Promise<ApiResponse<Contract>> => {
    return apiPut<Contract>(`/contracts/${id}`, contractData);
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

  // Get contract realized value from validated NFs
  getRealizedValue: (id: number): Promise<ApiResponse<{
    contract_id: number;
    contract_name: string;
    valor_original: number;
    valor_realizado: number;
    percentual_realizado: number;
    saldo_restante: number;
    total_nfs: number;
    nfs_validadas: number;
    nfs_pendentes: number;
    nfs: Array<{
      id: number;
      numero: string;
      nome_fornecedor: string;
      valor_total: number;
      status_processamento: string;
      data_emissao: string;
    }>;
  }>> => {
    return apiGet(`/nf/contract/${id}/realized-value`);
  },

  // Update contract progress
  updateProgress: async (id: number, progress: number): Promise<ApiResponse<Contract>> => {
    return apiPut<Contract>(`/contracts/${id}`, { progress });
  }
};