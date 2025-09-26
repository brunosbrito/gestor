import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notasFiscaisService } from '@/services/notasFiscaisService';
import { useToast } from '@/hooks/use-toast';

export interface NotaFiscal {
  id: number;
  numero: string;
  serie: string;
  chave_acesso?: string;
  fornecedor: string;
  cnpj_fornecedor: string;
  valor_total: number;
  valor_produtos?: number;
  valor_impostos?: number;
  valor_frete?: number;
  data_emissao?: string;
  data_entrada?: string;
  status_processamento: string;
  pasta_origem: string;
  subpasta?: string;
  observacoes?: string;
  created_at?: string;
  processed_at?: string;
  items: NotaFiscalItem[];
}

export interface NotaFiscalItem {
  id: number;
  numero_item: number;
  codigo_produto?: string;
  descricao: string;
  ncm?: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
  valor_total: number;
  peso_liquido?: number;
  peso_bruto?: number;
  centro_custo_id?: number;
  centro_custo?: string;
  item_orcamento_id?: number;
  score_classificacao?: number;
  fonte_classificacao?: string;
  status_integracao: string;
  integrado_em?: string;
}

export interface ContractNFsDetailedResponse {
  contract: {
    id: number;
    numero_contrato: string;
    nome_projeto: string;
    cliente: string;
    valor_original: number;
    status: string;
  };
  summary: {
    total_nfs: number;
    nfs_validadas: number;
    nfs_pendentes: number;
    nfs_erro: number;
    valor_realizado: number;
    percentual_realizado: number;
    saldo_restante: number;
    total_itens: number;
  };
  nfs: NotaFiscal[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface NFListFilters {
  status?: string;
  supplier?: string;
  contract_id?: number;
  pasta_origem?: string;
}

// Hook para buscar notas fiscais com filtros
export const useNotasFiscais = (filters?: NFListFilters, skip: number = 0, limit: number = 10) => {
  return useQuery({
    queryKey: ['notas-fiscais', filters, skip, limit],
    queryFn: () => notasFiscaisService.getAll(filters, skip, limit),
  });
};

// Hook para buscar uma nota fiscal específica
export const useNotaFiscal = (id: number) => {
  return useQuery({
    queryKey: ['notas-fiscais', id],
    queryFn: () => notasFiscaisService.getById(id),
    enabled: !!id,
  });
};

// Hook para buscar NFs de um contrato com detalhes completos
export const useContractNFsDetailed = (contractId: number, skip: number = 0, limit: number = 50) => {
  return useQuery<any, any, { data: ContractNFsDetailedResponse }>({
    queryKey: ['contract-nfs-detailed', contractId, skip, limit],
    queryFn: () => notasFiscaisService.getContractNFsDetailed(contractId, skip, limit),
    enabled: !!contractId,
  });
};

// Hook para buscar estatísticas das notas fiscais
export const useNFStats = () => {
  return useQuery({
    queryKey: ['nf-stats'],
    queryFn: () => notasFiscaisService.getStats(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook para buscar logs de processamento
export const useProcessingLogs = (skip: number = 0, limit: number = 10) => {
  return useQuery({
    queryKey: ['processing-logs', skip, limit],
    queryFn: () => notasFiscaisService.getProcessingLogs(skip, limit),
  });
};

// Hook para validar uma nota fiscal
export const useValidateNotaFiscal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (nfId: number) => notasFiscaisService.validateNF(nfId),
    onSuccess: (data, nfId) => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais', nfId] });
      queryClient.invalidateQueries({ queryKey: ['contract-nfs-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });

      toast({
        title: "Sucesso",
        description: "Nota fiscal validada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao validar nota fiscal",
        variant: "destructive",
      });
    },
  });
};

// Hook para processar pasta de notas fiscais
export const useProcessFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (folderName: string) => notasFiscaisService.processFolder(folderName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-logs'] });

      toast({
        title: "Processamento Iniciado",
        description: "O processamento da pasta foi iniciado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar pasta",
        variant: "destructive",
      });
    },
  });
};

// Hook para atualizar item de nota fiscal
export const useUpdateNFItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: Partial<NotaFiscalItem> }) =>
      notasFiscaisService.updateItem(itemId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      queryClient.invalidateQueries({ queryKey: ['contract-nfs-detailed'] });

      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar item",
        variant: "destructive",
      });
    },
  });
};

// Hook para classificar item automaticamente
export const useClassifyNFItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemId: number) => notasFiscaisService.classifyItem(itemId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      queryClient.invalidateQueries({ queryKey: ['contract-nfs-detailed'] });

      if (data.data.success) {
        toast({
          title: "Sucesso",
          description: "Item classificado automaticamente",
        });
      } else {
        toast({
          title: "Aviso",
          description: data.data.message || "Não foi possível classificar automaticamente",
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao classificar item",
        variant: "destructive",
      });
    },
  });
};

// Hook para integrar item ao contrato
export const useIntegrateNFItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ itemId, contractId, budgetItemId }: {
      itemId: number;
      contractId: number;
      budgetItemId: number
    }) =>
      notasFiscaisService.integrateItem(itemId, contractId, budgetItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      queryClient.invalidateQueries({ queryKey: ['contract-nfs-detailed'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });

      toast({
        title: "Sucesso",
        description: "Item integrado ao orçamento com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao integrar item",
        variant: "destructive",
      });
    },
  });
};