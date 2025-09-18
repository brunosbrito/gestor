import { useQuery, useMutation } from '@tanstack/react-query';
import { accountsService } from '@/services/accountsService';
import { useToast } from '@/hooks/use-toast';

export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsService.getAll(),
  });
};

export const useAccount = (id: number) => {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountsService.getById(id),
    enabled: !!id,
  });
};

export const useAccountKPIs = () => {
  return useQuery({
    queryKey: ['accounts', 'kpis'],
    queryFn: () => accountsService.getKPIs(),
  });
};

export const useAccountMovements = (accountId: number, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['accounts', accountId, 'movements', startDate, endDate],
    queryFn: () => accountsService.getMovements(accountId, startDate, endDate),
    enabled: !!accountId,
  });
};

export const useGenerateStatement = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ accountId, format }: { accountId: number; format?: 'pdf' | 'excel' }) => 
      accountsService.generateStatement(accountId, format),
    onSuccess: (data) => {
      toast({
        title: "Sucesso",
        description: "Extrato gerado com sucesso",
      });
      // Open the generated file
      if (data.data.url) {
        window.open(data.data.url, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar extrato",
        variant: "destructive",
      });
    },
  });
};

export const useExportAnalysis = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (format: 'pdf' | 'excel' = 'pdf') => accountsService.exportAnalysis(format),
    onSuccess: (data) => {
      toast({
        title: "Sucesso",
        description: "Análise financeira exportada com sucesso",
      });
      if (data.data.url) {
        window.open(data.data.url, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao exportar análise",
        variant: "destructive",
      });
    },
  });
};