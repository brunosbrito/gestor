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