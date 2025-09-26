import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { ApiResponse } from '@/types';
import { NotaFiscal, NotaFiscalItem, ContractNFsDetailedResponse, NFListFilters } from '@/hooks/useNotasFiscais';

export interface NFListResponse {
  nfs: Array<{
    id: number;
    number: string;
    series: string;
    supplier: string;
    contract?: string;
    contract_id?: number;
    valor_total: number;
    date?: string;
    status: string;
    pasta_origem: string;
    subpasta?: string;
    chave_acesso?: string;
    items_count: number;
    processed_at?: string;
  }>;
  total: number;
  page: number;
  per_page: number;
}

export interface NFStatsResponse {
  total_nfs: number;
  pending_validation: number;
  validated: number;
  rejected: number;
  total_value: number;
  status_distribution: Record<string, number>;
}

export interface ProcessingLog {
  id: number;
  pasta_nome: string;
  webhook_chamado_em: string;
  status: string;
  quantidade_arquivos?: number;
  quantidade_nfs?: number;
  mensagem?: string;
  detalhes_erro?: string;
  created_at: string;
}

export interface ProcessingLogsResponse {
  logs: ProcessingLog[];
  total: number;
  page: number;
  per_page: number;
}

export const notasFiscaisService = {
  // Get all notas fiscais with filters
  getAll: async (filters?: NFListFilters, skip: number = 0, limit: number = 10): Promise<ApiResponse<NFListResponse>> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.supplier) {
      params.append('supplier', filters.supplier);
    }
    if (filters?.contract_id) {
      params.append('contract_id', filters.contract_id.toString());
    }
    if (filters?.pasta_origem) {
      params.append('pasta_origem', filters.pasta_origem);
    }

    return apiGet<NFListResponse>(`/nf?${params.toString()}`);
  },

  // Get nota fiscal by ID
  getById: async (id: number): Promise<ApiResponse<NotaFiscal>> => {
    return apiGet<NotaFiscal>(`/nf/${id}`);
  },

  // Get contract NFs with detailed items
  getContractNFsDetailed: async (contractId: number, skip: number = 0, limit: number = 50): Promise<ApiResponse<ContractNFsDetailedResponse>> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    return apiGet<ContractNFsDetailedResponse>(`/nf/contract/${contractId}/detailed?${params.toString()}`);
  },

  // Get NFs by folder
  getByFolder: async (folderName: string, skip: number = 0, limit: number = 10): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    return apiGet(`/nf/by-folder/${encodeURIComponent(folderName)}?${params.toString()}`);
  },

  // Get stats
  getStats: async (): Promise<ApiResponse<NFStatsResponse>> => {
    return apiGet<NFStatsResponse>('/nf/stats');
  },

  // Get processing logs
  getProcessingLogs: async (skip: number = 0, limit: number = 10): Promise<ApiResponse<ProcessingLogsResponse>> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    return apiGet<ProcessingLogsResponse>(`/nf/processing-logs?${params.toString()}`);
  },

  // Validate nota fiscal
  validateNF: async (nfId: number): Promise<ApiResponse<{
    success: boolean;
    message: string;
    nf_id: number;
    status: string;
    contrato_id?: number;
    valor_realizado_contrato?: number;
    validated_by: string;
    validated_at: string;
  }>> => {
    return apiPatch(`/nf/${nfId}/validate`);
  },

  // Process folder
  processFolder: async (folderName: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    webhook_status: number;
    processing_log_id: number;
    n8n_url: string;
  }>> => {
    return apiPost('/nf/process-folder', {
      nome_pasta: folderName,
    });
  },

  // Update NF item
  updateItem: async (itemId: number, data: Partial<NotaFiscalItem>): Promise<ApiResponse<{
    success: boolean;
    message: string;
    item: {
      id: number;
      centro_custo_id?: number;
      item_orcamento_id?: number;
      score_classificacao?: number;
      fonte_classificacao?: string;
      status_integracao: string;
      updated_at?: string;
    };
  }>> => {
    return apiPatch(`/nf/item/${itemId}`, data);
  },

  // Classify item automatically
  classifyItem: async (itemId: number): Promise<ApiResponse<{
    success: boolean;
    message: string;
    item_id: number;
    centro_custo_id?: number;
    score_classificacao?: number;
    fonte_classificacao?: string;
    suggestion?: string;
  }>> => {
    return apiPost(`/nf/item/${itemId}/classify`);
  },

  // Integrate item to contract budget
  integrateItem: async (itemId: number, contractId: number, budgetItemId: number): Promise<ApiResponse<{
    success: boolean;
    message: string;
    item_id: number;
    contrato_id: number;
    item_orcamento_id: number;
  }>> => {
    return apiPatch(`/nf/item/${itemId}/integrate`, {
      contrato_id: contractId,
      item_orcamento_id: budgetItemId,
    });
  },
};