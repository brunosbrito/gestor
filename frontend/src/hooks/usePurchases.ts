import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchasesService } from '@/services/purchasesService';
import { Purchase } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const usePurchases = (contractId?: number) => {
  return useQuery({
    queryKey: ['purchases', contractId],
    queryFn: () => purchasesService.getAll(contractId),
  });
};

export const usePurchase = (id: number) => {
  return useQuery({
    queryKey: ['purchases', id],
    queryFn: () => purchasesService.getById(id),
    enabled: !!id,
  });
};

export const usePurchaseKPIs = () => {
  return useQuery({
    queryKey: ['purchases', 'kpis'],
    queryFn: () => purchasesService.getKPIs(),
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (purchase: Omit<Purchase, 'id'>) => purchasesService.create(purchase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast({
        title: "Sucesso",
        description: "Compra criada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar compra",
        variant: "destructive",
      });
    },
  });
};

export const useApprovePurchase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => purchasesService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast({
        title: "Sucesso",
        description: "Compra aprovada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao aprovar compra",
        variant: "destructive",
      });
    },
  });
};

export const useQuotations = (purchaseId: number) => {
  return useQuery({
    queryKey: ['quotations', purchaseId],
    queryFn: () => purchasesService.getQuotations(purchaseId),
    enabled: !!purchaseId,
  });
};