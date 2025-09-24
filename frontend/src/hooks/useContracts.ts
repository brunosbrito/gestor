import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractsService } from '@/services/contractsService';
import { Contract, ContractDetails, ContractType, BudgetItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useContracts = () => {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractsService.getAll(),
  });
};

export const useContract = (id: number) => {
  return useQuery<any, any, { data: ContractDetails }>({
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

export const useContractRealizedValue = (id: number) => {
  return useQuery({
    queryKey: ['contracts', id, 'realized-value'],
    queryFn: () => contractsService.getRealizedValue(id),
    enabled: !!id,
  });
};

export interface CreateContractData {
  name: string;
  client: string;
  startDate: string;
  contractType: ContractType;
  description?: string;
  qqpFile: File; // Arquivo QQP_Cliente obrigatório
}

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (contractData: CreateContractData) => {
      // Extrair arquivo e dados do contrato
      const { qqpFile, ...contractInfo } = contractData;
      return contractsService.create(contractInfo, qqpFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: "Sucesso",
        description: "Contrato criado com sucesso com dados extraídos do arquivo QQP_Cliente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar contrato. Verifique se o arquivo possui a sheet 'QQP_Cliente'",
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