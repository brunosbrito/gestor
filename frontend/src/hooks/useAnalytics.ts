import { useQuery, useMutation } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { useToast } from '@/hooks/use-toast';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsService.getAll(),
  });
};

export const useROI = (period?: string) => {
  return useQuery({
    queryKey: ['analytics', 'roi', period],
    queryFn: () => analyticsService.getROI(period),
  });
};

export const useCostEvolution = (months: number = 6) => {
  return useQuery({
    queryKey: ['analytics', 'cost-evolution', months],
    queryFn: () => analyticsService.getCostEvolution(months),
  });
};

export const useSupplierPerformance = () => {
  return useQuery({
    queryKey: ['analytics', 'supplier-performance'],
    queryFn: () => analyticsService.getSupplierPerformance(),
  });
};

export const useInsights = () => {
  return useQuery({
    queryKey: ['analytics', 'insights'],
    queryFn: () => analyticsService.getInsights(),
  });
};

export const useQuoteMetrics = () => {
  return useQuery({
    queryKey: ['analytics', 'quote-metrics'],
    queryFn: () => analyticsService.getQuoteMetrics(),
  });
};

export const useExportAnalytics = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (format: 'pdf' | 'excel' = 'excel') => analyticsService.exportData(format),
    onSuccess: (data) => {
      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso",
      });
      if (data.data.url) {
        window.open(data.data.url, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao exportar dados",
        variant: "destructive",
      });
    },
  });
};