import { apiGet, apiPost, apiUpload, apiDelete } from '@/lib/api';
import {
  Invoice,
  InvoiceUploadResponse,
  InvoicesSummary,
  OneDriveUrlRequest,
  ApiResponse
} from '@/types';

export const invoiceService = {
  // Upload ZIP com notas fiscais
  uploadZip: async (contractId: number, file: File): Promise<ApiResponse<InvoiceUploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiUpload<InvoiceUploadResponse>(`/invoices/upload-zip/${contractId}`, formData);
  },

  // Processar pasta do OneDrive
  processOneDriveUrl: async (contractId: number, folderUrl: string): Promise<ApiResponse<InvoiceUploadResponse>> => {
    const request: OneDriveUrlRequest = {
      folder_url: folderUrl
    };

    return apiPost<InvoiceUploadResponse>(`/invoices/onedrive-url/${contractId}`, request);
  },

  // Listar invoices de um contrato
  getContractInvoices: async (contractId: number): Promise<ApiResponse<Invoice[]>> => {
    return apiGet<Invoice[]>(`/invoices/contract/${contractId}`);
  },

  // Obter resumo das invoices de um contrato
  getContractInvoicesSummary: async (contractId: number): Promise<ApiResponse<InvoicesSummary>> => {
    return apiGet<InvoicesSummary>(`/invoices/contract/${contractId}/summary`);
  },

  // Obter itens de uma invoice específica
  getInvoiceItems: async (invoiceId: number): Promise<ApiResponse<any[]>> => {
    return apiGet<any[]>(`/invoices/${invoiceId}/items`);
  },

  // Deletar uma invoice
  deleteInvoice: async (invoiceId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiDelete<{ message: string }>(`/invoices/${invoiceId}`);
  },

  // Validar se arquivo é ZIP válido
  isValidZipFile: (fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.zip');
  },

  // Validar URL do OneDrive
  isValidOneDriveUrl: (url: string): boolean => {
    const oneDriveDomains = [
      'onedrive.live.com',
      '1drv.ms',
      'sharepoint.com',
      'office.com'
    ];

    return oneDriveDomains.some(domain => url.toLowerCase().includes(domain));
  }
};