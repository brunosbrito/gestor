import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoiceService';
import { Invoice, InvoiceUploadResponse, InvoicesSummary } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Hook para listar invoices de um contrato
export const useContractInvoices = (contractId: number) => {
  return useQuery({
    queryKey: ['invoices', 'contract', contractId],
    queryFn: () => invoiceService.getContractInvoices(contractId),
    enabled: !!contractId,
  });
};

// Hook para obter resumo das invoices
export const useContractInvoicesSummary = (contractId: number) => {
  return useQuery({
    queryKey: ['invoices', 'summary', contractId],
    queryFn: () => invoiceService.getContractInvoicesSummary(contractId),
    enabled: !!contractId,
  });
};

// Hook para upload de ZIP
export const useUploadInvoicesZip = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ contractId, file }: { contractId: number; file: File }) =>
      invoiceService.uploadZip(contractId, file),
    onSuccess: (response, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['invoices', 'contract', variables.contractId] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'summary', variables.contractId] });

      const data = response.data;
      toast({
        title: "Upload Concluído",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Upload",
        description: error.message || "Erro ao processar arquivo ZIP",
        variant: "destructive",
      });
    },
  });
};

// Hook para processar URL do OneDrive
export const useProcessOneDriveUrl = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ contractId, folderUrl }: { contractId: number; folderUrl: string }) =>
      invoiceService.processOneDriveUrl(contractId, folderUrl),
    onSuccess: (response, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['invoices', 'contract', variables.contractId] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'summary', variables.contractId] });

      const data = response.data;
      toast({
        title: "Processamento Concluído",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Processamento",
        description: error.message || "Erro ao processar pasta do OneDrive",
        variant: "destructive",
      });
    },
  });
};

// Hook para deletar invoice
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (invoiceId: number) => invoiceService.deleteInvoice(invoiceId),
    onSuccess: () => {
      // Invalidate all invoice queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });

      toast({
        title: "Sucesso",
        description: "Nota fiscal removida com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover nota fiscal",
        variant: "destructive",
      });
    },
  });
};

// Hook para obter itens de uma invoice
export const useInvoiceItems = (invoiceId: number) => {
  return useQuery({
    queryKey: ['invoices', invoiceId, 'items'],
    queryFn: () => invoiceService.getInvoiceItems(invoiceId),
    enabled: !!invoiceId,
  });
};