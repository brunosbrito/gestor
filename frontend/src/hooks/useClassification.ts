import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classificationService, CostCenter, ClassificationRule } from '@/services/classificationService';
import { useToast } from '@/hooks/use-toast';

// Cost Centers
export const useCostCenters = () => {
  return useQuery({
    queryKey: ['cost-centers'],
    queryFn: () => classificationService.getCostCenters(),
  });
};

export const useCreateCostCenter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (costCenter: Omit<CostCenter, 'id'>) => 
      classificationService.createCostCenter(costCenter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast({
        title: "Sucesso",
        description: "Centro de custo criado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar centro de custo",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCostCenter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, costCenter }: { id: string; costCenter: Partial<CostCenter> }) =>
      classificationService.updateCostCenter(id, costCenter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast({
        title: "Sucesso",
        description: "Centro de custo atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar centro de custo",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCostCenter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => classificationService.deleteCostCenter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast({
        title: "Sucesso",
        description: "Centro de custo removido com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover centro de custo",
        variant: "destructive",
      });
    },
  });
};

// Classification Rules
export const useClassificationRules = () => {
  return useQuery({
    queryKey: ['classification-rules'],
    queryFn: () => classificationService.getClassificationRules(),
  });
};

export const useCreateClassificationRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (rule: Omit<ClassificationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
      const validation = classificationService.validateRule(rule);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      return classificationService.createClassificationRule(rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-rules'] });
      toast({
        title: "Sucesso",
        description: "Regra de classificação criada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar regra de classificação",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateClassificationRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, rule }: { id: string; rule: Partial<ClassificationRule> }) =>
      classificationService.updateClassificationRule(id, rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-rules'] });
      toast({
        title: "Sucesso",
        description: "Regra de classificação atualizada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar regra de classificação",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteClassificationRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => classificationService.deleteClassificationRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classification-rules'] });
      toast({
        title: "Sucesso",
        description: "Regra de classificação removida com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover regra de classificação",
        variant: "destructive",
      });
    },
  });
};

// Auto Classification
export const useClassifyItem = () => {
  return useMutation({
    mutationFn: ({ 
      itemDescription, 
      itemValue, 
      supplier, 
      ncm 
    }: { 
      itemDescription: string; 
      itemValue?: number; 
      supplier?: string; 
      ncm?: string;
    }) => classificationService.classifyItem(itemDescription, itemValue, supplier, ncm),
  });
};

export const useClassifyNFItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ nfId, threshold }: { nfId: number; threshold?: number }) =>
      classificationService.classifyNFItems(nfId, threshold),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      
      const result = data.data;
      toast({
        title: "Classificação Automática Concluída",
        description: `${result.autoClassified} itens classificados automaticamente. ${result.needsReview} necessitam revisão.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Classificação",
        description: error.message || "Erro ao classificar itens da NF",
        variant: "destructive",
      });
    },
  });
};

export const useBatchClassifyItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (items: Array<{
      id: number;
      description: string;
      value?: number;
      supplier?: string;
      ncm?: string;
    }>) => classificationService.batchClassifyItems(items),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['classification-stats'] });
      
      const result = data.data;
      toast({
        title: "Classificação em Lote Concluída",
        description: `${result.totalClassified} itens classificados. ${result.totalNeedReview} necessitam revisão.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Classificação em Lote",
        description: error.message || "Erro ao classificar itens em lote",
        variant: "destructive",
      });
    },
  });
};

// Manual Classification
export const useAssignCostCenter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      itemId, 
      costCenterId, 
      source = 'manual'
    }: { 
      itemId: number; 
      costCenterId: string;
      source?: 'manual' | 'rule' | 'ml';
    }) => classificationService.assignCostCenter(itemId, costCenterId, source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      queryClient.invalidateQueries({ queryKey: ['classification-stats'] });
      toast({
        title: "Sucesso",
        description: "Centro de custo atribuído com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atribuir centro de custo",
        variant: "destructive",
      });
    },
  });
};

// Training
export const useTrainClassifier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (trainingData: Array<{
      itemDescription: string;
      correctCostCenterId: string;
      itemValue?: number;
      supplier?: string;
    }>) => classificationService.trainClassifier(trainingData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['classification-stats'] });
      
      const result = data.data;
      toast({
        title: "Treinamento Concluído",
        description: result.accuracy 
          ? `Modelo treinado com ${(result.accuracy * 100).toFixed(1)}% de precisão`
          : "Modelo de classificação treinado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Treinamento",
        description: error.message || "Erro ao treinar o classificador",
        variant: "destructive",
      });
    },
  });
};

// Statistics
export const useClassificationStats = () => {
  return useQuery({
    queryKey: ['classification-stats'],
    queryFn: () => classificationService.getClassificationStats(),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

// Utility hooks
export const useKeywordSuggestions = (description: string) => {
  return {
    data: description ? classificationService.getKeywordSuggestions(description) : [],
    isLoading: false,
    error: null
  };
};

export const useValidateRule = (rule: Omit<ClassificationRule, 'id' | 'createdAt' | 'updatedAt'> | null) => {
  if (!rule) return { valid: false, errors: [], warnings: [] };
  
  return classificationService.validateRule(rule);
};