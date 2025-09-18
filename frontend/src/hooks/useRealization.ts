import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { realizationService } from '@/services/realizationService';
import { useToast } from '@/hooks/use-toast';

export const useContractExecution = (contractId: number) => {
  return useQuery({
    queryKey: ['contract-execution', contractId],
    queryFn: () => realizationService.getContractExecution(contractId),
    enabled: !!contractId,
  });
};

export const useLinkingSuggestions = (nfId: number, contractId: number) => {
  return useQuery({
    queryKey: ['linking-suggestions', nfId, contractId],
    queryFn: () => realizationService.generateLinkingSuggestions(nfId, contractId),
    enabled: !!nfId && !!contractId,
  });
};

export const useLinkNFToBudget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (linkingData: {
      nfId: number;
      contractId: number;
      links: { nfItemId: number; budgetItemId: string }[];
    }) => realizationService.linkNFToBudget(linkingData),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contract-execution', variables.contractId] });
      queryClient.invalidateQueries({ queryKey: ['nf'] });
      
      toast({
        title: "Vinculação realizada",
        description: `${result.data.linkedItems.length} itens vinculados ao orçamento`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na vinculação",
        description: error.message || "Erro ao vincular itens ao orçamento",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateRealization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      contractId,
      budgetItemId,
      realization
    }: {
      contractId: number;
      budgetItemId: string;
      realization: any;
    }) => realizationService.updateRealization(contractId, budgetItemId, realization),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contract-execution', variables.contractId] });
      
      toast({
        title: "Realização atualizada",
        description: "Dados de realização atualizados com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na atualização",
        description: error.message || "Erro ao atualizar realização",
        variant: "destructive",
      });
    },
  });
};

export const useRecalculateExecution = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (contractId: number) => realizationService.recalculateExecution(contractId),
    onSuccess: (result, contractId) => {
      queryClient.invalidateQueries({ queryKey: ['contract-execution', contractId] });
      
      toast({
        title: "Realização recalculada",
        description: "Dados de realização atualizados com base nas NFs vinculadas",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no recálculo",
        description: error.message || "Erro ao recalcular realização",
        variant: "destructive",
      });
    },
  });
};

export const useUnlinkedNFs = (contractId: number) => {
  return useQuery({
    queryKey: ['unlinked-nfs', contractId],
    queryFn: () => realizationService.getUnlinkedNFs(contractId),
    enabled: !!contractId,
  });
};

export const useBudgetItemRealization = (contractId: number, budgetItemId: string) => {
  return useQuery({
    queryKey: ['budget-item-realization', contractId, budgetItemId],
    queryFn: () => realizationService.getBudgetItemRealization(contractId, budgetItemId),
    enabled: !!contractId && !!budgetItemId,
  });
};