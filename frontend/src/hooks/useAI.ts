import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

export const useChatHistory = (limit?: number) => {
  return useQuery({
    queryKey: ['ai', 'chat', 'history', limit],
    queryFn: () => aiService.getChatHistory(limit),
  });
};

export const useQuickActions = () => {
  return useQuery({
    queryKey: ['ai', 'quick-actions'],
    queryFn: () => aiService.getQuickActions(),
  });
};

export const useBudgetAlerts = () => {
  return useQuery({
    queryKey: ['ai', 'alerts', 'budget'],
    queryFn: () => aiService.getBudgetAlerts(),
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ message, context }: { 
      message: string; 
      context?: {
        contractId?: number;
        type?: 'analysis' | 'recommendation' | 'general';
      }
    }) => aiService.sendMessage(message, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'chat', 'history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Comunicação",
        description: error.message || "Erro ao enviar mensagem",
        variant: "destructive",
      });
    },
  });
};

export const useExecuteQuickAction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ actionId, context }: { actionId: string; context?: any }) => 
      aiService.executeQuickAction(actionId, context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'chat', 'history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Ação",
        description: error.message || "Erro ao executar ação",
        variant: "destructive",
      });
    },
  });
};

export const useClearChatHistory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => aiService.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'chat', 'history'] });
      toast({
        title: "Histórico Limpo",
        description: "Histórico do chat foi removido",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao limpar histórico",
        variant: "destructive",
      });
    },
  });
};

export const useAnalyzeContract = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (contractId: number) => aiService.analyzeContract(contractId),
    onError: (error: any) => {
      toast({
        title: "Erro na Análise",
        description: error.message || "Erro ao analisar contrato",
        variant: "destructive",
      });
    },
  });
};

export const useAnalyzePurchases = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (contractId?: number) => aiService.analyzePurchases(contractId),
    onError: (error: any) => {
      toast({
        title: "Erro na Análise",
        description: error.message || "Erro ao analisar compras",
        variant: "destructive",
      });
    },
  });
};