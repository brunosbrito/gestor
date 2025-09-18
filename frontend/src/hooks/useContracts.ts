import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsService } from '@/services/contractsService';
import { Contract } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useContracts = () => {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractsService.getAll(),
  });
};

export const useContract = (id: number) => {
  return useQuery({
    queryKey: ['contracts', id],
    queryFn: () => contractsService.getById(id),
    enabled: !!id,
  });
};

export const useContractKPIs = () => {
  return useQuery({
    queryKey: ['contracts', 'kpis'],
    queryFn: () => contractsService.getKPIs(),
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (contract: Omit<Contract, 'id'>) => contractsService.create(contract),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Sucesso",
        description: "Contrato criado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar contrato",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, contract }: { id: number; contract: Partial<Contract> }) => 
      contractsService.update(id, contract),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', variables.id] });
      toast({
        title: "Sucesso",
        description: "Contrato atualizado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar contrato",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => contractsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Sucesso",
        description: "Contrato removido com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover contrato",
        variant: "destructive",
      });
    },
  });
};