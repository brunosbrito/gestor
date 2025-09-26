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
    monthly_stats: Array<{month: string; year: number; count: number; value: number}>;
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
    valor_total: number;
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

  // Process folder via n8n webhook
  processFolder: (folderName: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    webhook_status: number;
    processing_log_id: number;
    n8n_url: string;
  }>> => {
    return apiPost('/nf/process-folder', { nome_pasta: folderName });
  },

  // Get NFs by folder (subpasta)
  getByFolder: (
    folderName: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<ApiResponse<{
    folder_name: string;
    nfs: Array<{
      id: number;
      numero: string;
      serie: string;
      nome_fornecedor: string;
      valor_total: number;
      data_emissao: string;
      subpasta: string;
      status_processamento: string;
      contrato_id: number;
      itens_count: number;
    }>;
    total: number;
    page: number;
    per_page: number;
  }>> => {
    return apiGet(`/nf/by-folder/${encodeURIComponent(folderName)}`, {
      skip,
      limit
    });
  },

  // Get processing logs
  getProcessingLogs: (
    skip: number = 0,
    limit: number = 10
  ): Promise<ApiResponse<{
    logs: Array<{
      id: number;
      pasta_nome: string;
      webhook_chamado_em: string;
      status: string;
      quantidade_arquivos: number;
      quantidade_nfs: number;
      mensagem: string;
      detalhes_erro: string;
      created_at: string;
    }>;
    total: number;
    page: number;
    per_page: number;
  }>> => {
    return apiGet('/nf/processing-logs', { skip, limit });
  },

  // Validate NF (integrates with contract)
  validateNF: (id: number): Promise<ApiResponse<{
    success: boolean;
    message: string;
    nf_id: number;
    status: string;
    contrato_id: number;
    valor_realizado_contrato: number;
    validated_by: string;
    validated_at: string;
  }>> => {
    return apiPut(`/nf/${id}/validate`, {});
  },

  // Update NF item
  updateItem: (
    itemId: number,
    itemData: {
      centro_custo_id?: number;
      item_orcamento_id?: number;
      score_classificacao?: number;
      fonte_classificacao?: string;
      status_integracao?: string;
    }
  ): Promise<ApiResponse<{
    success: boolean;
    message: string;
    item: any;
  }>> => {
    return apiPut(`/nf/item/${itemId}`, itemData);
  },

  // Integrate item with contract budget
  integrateItem: (
    itemId: number,
    contratoId: number,
    itemOrcamentoId: number
  ): Promise<ApiResponse<{
    success: boolean;
    message: string;
    item_id: number;
    contrato_id: number;
    item_orcamento_id: number;
  }>> => {
    return apiPut(`/nf/item/${itemId}/integrate`, {
      contrato_id: contratoId,
      item_orcamento_id: itemOrcamentoId
    });
  },

  // Auto-classify item cost center
  classifyItem: (itemId: number): Promise<ApiResponse<{
    success: boolean;
    message: string;
    item_id: number;
    centro_custo_id?: number;
    score_classificacao?: number;
    fonte_classificacao?: string;
    suggestion?: string;
  }>> => {
    return apiPost(`/nf/item/${itemId}/classify`, {});
  },

};