import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onedriveService } from '@/services/onedriveService';
import { useToast } from '@/hooks/use-toast';

export const useOneDriveStatus = () => {
  return useQuery({
    queryKey: ['onedrive', 'status'],
    queryFn: () => onedriveService.getConnectionStatus(),
  });
};

export const useOneDriveFiles = (path?: string, type?: string) => {
  return useQuery({
    queryKey: ['onedrive', 'files', path, type],
    queryFn: () => onedriveService.getFiles(path, type),
    enabled: false, // Only fetch when explicitly called
  });
};

export const useSyncHistory = () => {
  return useQuery({
    queryKey: ['onedrive', 'sync', 'history'],
    queryFn: () => onedriveService.getSyncHistory(),
  });
};

export const useSyncSettings = () => {
  return useQuery({
    queryKey: ['onedrive', 'sync', 'settings'],
    queryFn: () => onedriveService.getSyncSettings(),
  });
};

export const useConnectOneDrive = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => onedriveService.connect(),
    onSuccess: (data) => {
      // Redirect to OneDrive OAuth
      window.location.href = data.data.authUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Conexão",
        description: error.message || "Erro ao conectar com OneDrive",
        variant: "destructive",
      });
    },
  });
};

export const useCompleteAuth = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (code: string) => onedriveService.completeAuth(code),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['onedrive', 'status'] });
      toast({
        title: "Conectado com Sucesso",
        description: `OneDrive conectado para ${data.data.user}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Autenticação",
        description: error.message || "Erro ao completar autenticação",
        variant: "destructive",
      });
    },
  });
};

export const useDisconnectOneDrive = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => onedriveService.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onedrive'] });
      toast({
        title: "Desconectado",
        description: "OneDrive desconectado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao desconectar",
        variant: "destructive",
      });
    },
  });
};

export const useStartSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ path, syncNFsOnly }: { path?: string; syncNFsOnly?: boolean }) => 
      onedriveService.startSync(path, syncNFsOnly),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onedrive', 'sync'] });
      toast({
        title: "Sincronização Iniciada",
        description: "Processamento de arquivos iniciado",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na Sincronização",
        description: error.message || "Erro ao iniciar sincronização",
        variant: "destructive",
      });
    },
  });
};

export const useSyncStatus = (syncId: number) => {
  return useQuery({
    queryKey: ['onedrive', 'sync', syncId],
    queryFn: () => onedriveService.getSyncStatus(syncId),
    enabled: !!syncId,
    refetchInterval: 2000, // Refetch every 2 seconds
  });
};

export const useCancelSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (syncId: number) => onedriveService.cancelSync(syncId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onedrive', 'sync'] });
      toast({
        title: "Sincronização Cancelada",
        description: "Processo cancelado com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cancelar sincronização",
        variant: "destructive",
      });
    },
  });
};

export const useConfigureSyncSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (settings: {
      autoSync?: boolean;
      syncInterval?: number;
      syncPath?: string;
      nfsOnly?: boolean;
      notifyOnSync?: boolean;
    }) => onedriveService.configureSyncSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onedrive', 'sync', 'settings'] });
      toast({
        title: "Configurações Salvas",
        description: "Configurações de sincronização atualizadas",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configurações",
        variant: "destructive",
      });
    },
  });
};