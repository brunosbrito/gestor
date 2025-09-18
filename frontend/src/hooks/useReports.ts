import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '@/services/reportsService';
import { useToast } from '@/hooks/use-toast';

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsService.getAll(),
  });
};

export const useReport = (id: number) => {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => reportsService.getById(id),
    enabled: !!id,
  });
};

export const useGenerateAnalyticalReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (contractId?: number) => reportsService.generateAnalytical(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Sucesso",
        description: "Relatório analítico sendo gerado",
      });
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

export const useGenerateAccountReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (contractId?: number) => reportsService.generateAccount(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Sucesso",
        description: "Relatório de conta corrente sendo gerado",
      });
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

export const useExportDashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (format: 'pdf' | 'excel' = 'pdf') => reportsService.exportDashboard(format),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Sucesso",
        description: "Dashboard sendo exportado",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao exportar dashboard",
        variant: "destructive",
      });
    },
  });
};

export const useDownloadReport = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => reportsService.download(id),
    onSuccess: (data) => {
      if (data.data.url) {
        window.open(data.data.url, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao baixar relatório",
        variant: "destructive",
      });
    },
  });
};