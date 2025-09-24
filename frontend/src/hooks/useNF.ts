import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nfService } from '@/services/nfService';
import { useToast } from '@/hooks/use-toast';

export const useNFs = (contractId?: number) => {
  return useQuery({
    queryKey: ['nf', contractId],
    queryFn: () => nfService.getAll(contractId),
  });
};

export const useNF = (id: number) => {
  return useQuery({
    queryKey: ['nf', id],
    queryFn: () => nfService.getById(id),
    enabled: !!id,
  });
};

export const useNFStats = () => {
  return useQuery({
    queryKey: ['nf', 'stats'],
    queryFn: () => nfService.getStats(),
  });
};

export const useImportNFXML = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) => 
      nfService.importXML(file, onProgress),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'stats'] });
      
      const result = data.data;
      toast({
        title: "Importação Concluída",
        description: `${result.notasFiscais.length} nota(s) fiscal(is) importada(s)`,
      });
      
      if (result.errors.length > 0) {
        toast({
          title: "Atenção",
          description: `${result.errors.length} erro(s) encontrado(s)`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Importação",
        description: error.message || "Erro ao importar NF",
        variant: "destructive",
      });
    },
  });
};

export const useImportNFBatch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) => 
      nfService.importBatch(file, onProgress),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'stats'] });
      
      const result = data.data;
      toast({
        title: "Importação em Lote Concluída",
        description: `${result.notasFiscais.length} nota(s) fiscal(is) processada(s)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Importação",
        description: error.message || "Erro ao importar lote de NFs",
        variant: "destructive",
      });
    },
  });
};

export const useImportNFPDF = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) => 
      nfService.importPDF(file, onProgress),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'stats'] });
      
      const result = data.data;
      toast({
        title: "OCR Concluído",
        description: `${result.notasFiscais.length} NF(s) extraída(s) do PDF`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no OCR",
        description: error.message || "Erro ao processar PDF",
        variant: "destructive",
      });
    },
  });
};

export const useValidateNF = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => nfService.validate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'stats'] });
      toast({
        title: "Sucesso",
        description: "NF validada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao validar NF",
        variant: "destructive",
      });
    },
  });
};

export const useRejectNF = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => nfService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'stats'] });
      toast({
        title: "NF Rejeitada",
        description: "Nota fiscal rejeitada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao rejeitar NF",
        variant: "destructive",
      });
    },
  });
};

export const useAssociateContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, contractId }: { id: number; contractId: number }) => 
      nfService.associateContract(id, contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      toast({
        title: "Sucesso",
        description: "NF associada ao contrato",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao associar NF",
        variant: "destructive",
      });
    },
  });
};

export const useProcessNF = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => nfService.process(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'stats'] });
      toast({
        title: "Sucesso",
        description: "NF processada para contabilidade",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar NF",
        variant: "destructive",
      });
    },
  });
};

// New hooks for n8n integration and enhanced features

export const useProcessFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (folderName: string) => nfService.processFolder(folderName),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'processing-logs'] });

      const result = data.data;
      toast({
        title: "Processamento Iniciado",
        description: result.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Processamento",
        description: error.message || "Erro ao processar pasta no n8n",
        variant: "destructive",
      });
    },
  });
};

export const useNFsByFolder = (folderName: string, skip = 0, limit = 10) => {
  return useQuery({
    queryKey: ['nf', 'by-folder', folderName, skip, limit],
    queryFn: () => nfService.getByFolder(folderName, skip, limit),
    enabled: !!folderName,
  });
};

export const useProcessingLogs = (skip = 0, limit = 10) => {
  return useQuery({
    queryKey: ['nf', 'processing-logs', skip, limit],
    queryFn: () => nfService.getProcessingLogs(skip, limit),
  });
};

export const useValidateNFNew = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => nfService.validateNF(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });

      const result = data.data;
      toast({
        title: "NF Validada",
        description: result.message,
      });

      // Show realized value update if contract is linked
      if (result.valor_realizado_contrato) {
        toast({
          title: "Valor Realizado Atualizado",
          description: `Novo valor realizado: R$ ${result.valor_realizado_contrato.toLocaleString('pt-BR')}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Validação",
        description: error.message || "Erro ao validar NF",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateNFItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ itemId, itemData }: {
      itemId: number;
      itemData: {
        centro_custo_id?: number;
        item_orcamento_id?: number;
        score_classificacao?: number;
        fonte_classificacao?: string;
        status_integracao?: string;
      }
    }) => nfService.updateItem(itemId, itemData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });

      const result = data.data;
      toast({
        title: "Item Atualizado",
        description: result.message,
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

export const useIntegrateNFItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      itemId,
      contratoId,
      itemOrcamentoId
    }: {
      itemId: number;
      contratoId: number;
      itemOrcamentoId: number;
    }) => nfService.integrateItem(itemId, contratoId, itemOrcamentoId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });

      const result = data.data;
      toast({
        title: "Item Integrado",
        description: result.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Integração",
        description: error.message || "Erro ao integrar item ao orçamento",
        variant: "destructive",
      });
    },
  });
};

export const useClassifyNFItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemId: number) => nfService.classifyItem(itemId),
    onSuccess: (data, itemId) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });

      const result = data.data;
      if (result.success) {
        toast({
          title: "Item Classificado",
          description: result.message,
        });
      } else {
        toast({
          title: "Classificação Automática",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Classificação",
        description: error.message || "Erro ao classificar item",
        variant: "destructive",
      });
    },
  });
};

export const useSearchNFs = () => {
  return useMutation({
    mutationFn: ({ query, filters }: { 
      query: string; 
      filters?: {
        status?: string;
        supplier?: string;
        contract?: string;
        dateFrom?: string;
        dateTo?: string;
      }
    }) => nfService.search(query, filters),
  });
};

export const useClassifyNFItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (nfId: number) => nfService.classifyItems(nfId),
    onSuccess: (data, nfId) => {
      queryClient.invalidateQueries({ queryKey: ['nf', nfId] });
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      
      const result = data.data;
      toast({
        title: "Classificação Concluída",
        description: `${result.classified} itens classificados automaticamente`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Classificação",
        description: error.message || "Erro ao classificar itens",
        variant: "destructive",
      });
    },
  });
};

export const useCostCenterSuggestions = () => {
  return useMutation({
    mutationFn: ({ itemDescription, itemValue }: { 
      itemDescription: string; 
      itemValue?: number;
    }) => nfService.getCostCenterSuggestions(itemDescription, itemValue),
  });
};

export const useBulkNFOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const bulkValidate = useMutation({
    mutationFn: (nfIds: number[]) => nfService.bulkValidate(nfIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'stats'] });
      
      const result = data.data;
      toast({
        title: "Validação em Lote",
        description: `${result.validated} NFs validadas com sucesso`,
      });
      
      if (result.errors.length > 0) {
        toast({
          title: "Avisos",
          description: `${result.errors.length} NFs não puderam ser validadas`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro na validação em lote",
        variant: "destructive",
      });
    },
  });

  const bulkReject = useMutation({
    mutationFn: ({ nfIds, reason }: { nfIds: number[]; reason: string }) => 
      nfService.bulkReject(nfIds, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'stats'] });
      
      const result = data.data;
      toast({
        title: "Rejeição em Lote",
        description: `${result.rejected} NFs rejeitadas`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro na rejeição em lote",
        variant: "destructive",
      });
    },
  });

  const bulkAssociate = useMutation({
    mutationFn: ({ nfIds, contractId }: { nfIds: number[]; contractId: number }) =>
      nfService.bulkAssociateContract(nfIds, contractId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      
      const result = data.data;
      toast({
        title: "Associação em Lote",
        description: `${result.associated} NFs associadas ao contrato`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro na associação em lote",
        variant: "destructive",
      });
    },
  });

  return { bulkValidate, bulkReject, bulkAssociate };
};

export const useImportWithClassification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      file, 
      options, 
      onProgress 
    }: { 
      file: File; 
      options: {
        contractId?: number;
        autoClassify: boolean;
        costCenterRules?: Array<{
          keyword: string;
          costCenter: string;
        }>;
      };
      onProgress?: (progress: number) => void;
    }) => nfService.importWithClassification(file, options, onProgress),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['nf', 'stats'] });
      
      const result = data.data;
      toast({
        title: "Importação Avançada Concluída",
        description: `${result.notasFiscais.length} NFs importadas e processadas`,
      });

      if (result.classificationResults && variables.options.autoClassify) {
        const totalClassified = result.classificationResults.reduce(
          (sum, r) => sum + r.itemsClassified, 
          0
        );
        if (totalClassified > 0) {
          toast({
            title: "Classificação Automática",
            description: `${totalClassified} itens classificados automaticamente`,
          });
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Importação",
        description: error.message || "Erro ao importar com classificação",
        variant: "destructive",
      });
    },
  });
};