import { useQuery, useMutation } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { useToast } from '@/hooks/use-toast';

export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => dashboardService.getKPIs(),
  });
};

export const useActiveContracts = () => {
  return useQuery({
    queryKey: ['dashboard', 'active-contracts'],
    queryFn: () => dashboardService.getActiveContracts(),
  });
};

export const useRecentActivities = (limit: number = 10) => {
  return useQuery({
    queryKey: ['dashboard', 'activities', limit],
    queryFn: () => dashboardService.getRecentActivities(limit),
  });
};

export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => dashboardService.getAlerts(),
  });
};

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: () => dashboardService.getAnalytics(),
  });
};

export const useGenerateDashboardReport = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (format: 'pdf' | 'excel' = 'pdf') => dashboardService.generateReport(format),
    onSuccess: (data) => {
      toast({
        title: "Relatório Gerado",
        description: "Relatório do dashboard criado com sucesso",
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