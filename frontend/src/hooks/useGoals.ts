import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalsService } from '@/services/goalsService';
import { Goal } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useGoals = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsService.getAll(),
  });
};

export const useGoal = (id: number) => {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: () => goalsService.getById(id),
    enabled: !!id,
  });
};

export const useGoalKPIs = () => {
  return useQuery({
    queryKey: ['goals', 'kpis'],
    queryFn: () => goalsService.getKPIs(),
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (goal: Omit<Goal, 'id'>) => goalsService.create(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar meta",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, goal }: { id: number; goal: Partial<Goal> }) => 
      goalsService.update(id, goal),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.id] });
      toast({
        title: "Sucesso",
        description: "Meta atualizada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar meta",
        variant: "destructive",
      });
    },
  });
};

export const useGenerateSavingsReport = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (contractId?: number) => goalsService.generateSavingsReport(contractId),
    onSuccess: (data) => {
      toast({
        title: "Sucesso",
        description: "Relatório de economia gerado",
      });
      if (data.data.url) {
        window.open(data.data.url, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar relatório",
        variant: "destructive",
      });
    },
  });
};

export const useConfigureGoals = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ contractId, targetReduction }: { contractId: number; targetReduction: number }) => 
      goalsService.configureGoals(contractId, targetReduction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "Sucesso",
        description: "Metas configuradas com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao configurar metas",
        variant: "destructive",
      });
    },
  });
};