import api, { apiGet, apiPost, apiUpload, apiPut, apiDelete } from '@/lib/api';
import { NotaFiscal, NFImportResult, ApiResponse } from '@/types';

export const nfService = {
  // Get all notas fiscais
  getAll: (contractId?: number): Promise<ApiResponse<NotaFiscal[]>> => {
    const params = contractId ? { contract_id: contractId } : undefined;
    return apiGet<NotaFiscal[]>('/nf', params);
  },

  // Get NF by ID
  getById: (id: number): Promise<ApiResponse<NotaFiscal>> => {
    return apiGet<NotaFiscal>(`/nf/${id}`);
  },

  // Get NF statistics
  getStats: (): Promise<ApiResponse<{
    total_nfs: number;
    pending_validation: number;
    validated: number;
    rejected: number;
    total_value: number;
    monthly_stats: Array<{month: string; count: number; value: number}>;
    status_distribution: Record<string, number>;
  }>> => {
    return apiGet('/nf/stats');
  },

  // Import NF from XML file
  importXML: (file: File, contractId?: number, onProgress?: (progress: number) => void): Promise<ApiResponse<NFImportResult>> => {
    return apiUpload<NFImportResult>('/nf/import', file, onProgress);
  },

  // Create new NF
  create: (nfData: {
    number: string;
    series: string;
    supplier: string;
    value: number;
    contract_id?: number;
  }): Promise<ApiResponse<NotaFiscal>> => {
    return apiPost<NotaFiscal>('/nf', nfData);
  },

  // Update NF
  update: (id: number, nfData: Partial<NotaFiscal>): Promise<ApiResponse<NotaFiscal>> => {
    return apiPut<NotaFiscal>(`/nf/${id}`, nfData);
  },

  // Validate NF
  validate: (id: number): Promise<ApiResponse<NotaFiscal>> => {
    return apiPut<NotaFiscal>(`/nf/${id}/validate`, {});
  },

  // Reject NF
  reject: (id: number, reason: string): Promise<ApiResponse<NotaFiscal>> => {
    return apiPut<NotaFiscal>(`/nf/${id}/reject`, { reason });
  },

  // Delete NF
  delete: (id: number): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/nf/${id}`);
  },

};