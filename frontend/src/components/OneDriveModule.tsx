import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useOneDriveStatus, 
  useConnectOneDrive, 
  useDisconnectOneDrive,
  useStartSync,
  useSyncHistory,
  useSyncSettings,
  useConfigureSyncSettings
} from "@/hooks/useOneDrive";
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Settings, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Calendar,
  Clock
} from "lucide-react";

export const OneDriveModule = () => {
  const [syncPath, setSyncPath] = useState("/NotasFiscais");
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(60);
  const [nfsOnly, setNfsOnly] = useState(true);

  const { data: status, isLoading: statusLoading } = useOneDriveStatus();
  const { data: syncHistory, isLoading: historyLoading } = useSyncHistory();
  const { data: settings, isLoading: settingsLoading } = useSyncSettings();
  
  const connectOneDrive = useConnectOneDrive();
  const disconnectOneDrive = useDisconnectOneDrive();
  const startSync = useStartSync();
  const configureSyncSettings = useConfigureSyncSettings();

  const getSyncStatusColor = (syncStatus: string) => {
    switch (syncStatus) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'running':
        return 'bg-primary/10 text-primary';
      case 'error':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleSaveSettings = () => {
    configureSyncSettings.mutate({
      autoSync,
      syncInterval,
      syncPath,
      nfsOnly,
      notifyOnSync: true
    });
  };

  if (statusLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integração OneDrive</h1>
          <p className="text-muted-foreground">
            Sincronize automaticamente documentos e notas fiscais
          </p>
        </div>
        <div className="flex gap-3">
          {status?.data.connected ? (
            <Button 
              variant="outline"
              onClick={() => disconnectOneDrive.mutate()}
              disabled={disconnectOneDrive.isPending}
            >
              <CloudOff className="h-4 w-4" />
              Desconectar
            </Button>
          ) : (
            <Button 
              variant="premium"
              onClick={() => connectOneDrive.mutate()}
              disabled={connectOneDrive.isPending}
            >
              <Cloud className="h-4 w-4" />
              Conectar OneDrive
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <Card className="bg-gradient-card border-0 shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status?.data.connected ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status?.data.connected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Usuário:</span>
                <span className="font-medium">{status.data.user}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Última Sincronização:</span>
                <span className="font-medium">
                  {status.data.lastSync 
                    ? new Date(status.data.lastSync).toLocaleString('pt-BR')
                    : 'Nunca'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de Arquivos:</span>
                <span className="font-medium">{status.data.totalFiles || 0}</span>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={() => startSync.mutate({ path: syncPath, syncNFsOnly: nfsOnly })}
                  disabled={startSync.isPending}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {startSync.isPending ? 'Iniciando...' : 'Iniciar Sincronização'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                OneDrive não está conectado. Conecte sua conta para sincronizar documentos automaticamente.
              </p>
              <Button 
                onClick={() => connectOneDrive.mutate()}
                disabled={connectOneDrive.isPending}
              >
                <Cloud className="h-4 w-4 mr-2" />
                Conectar OneDrive
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {status?.data.connected && (
        <>
          {/* Sync Settings */}
          <Card className="bg-gradient-card border-0 shadow-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Sincronização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="syncPath">Pasta de Sincronização</Label>
                    <Input
                      id="syncPath"
                      value={syncPath}
                      onChange={(e) => setSyncPath(e.target.value)}
                      placeholder="/NotasFiscais"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="syncInterval">Intervalo (minutos)</Label>
                    <Input
                      id="syncInterval"
                      type="number"
                      value={syncInterval}
                      onChange={(e) => setSyncInterval(Number(e.target.value))}
                      min="15"
                      max="1440"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoSync">Sincronização Automática</Label>
                    <Switch
                      id="autoSync"
                      checked={autoSync}
                      onCheckedChange={setAutoSync}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="nfsOnly">Apenas Notas Fiscais</Label>
                    <Switch
                      id="nfsOnly"
                      checked={nfsOnly}
                      onCheckedChange={setNfsOnly}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={configureSyncSettings.isPending}
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sync History */}
          <Card className="bg-gradient-card border-0 shadow-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Sincronizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {syncHistory?.data.map((sync) => (
                    <div key={sync.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={getSyncStatusColor(sync.status)}>
                              {sync.status === 'completed' && 'Concluída'}
                              {sync.status === 'running' && 'Em Andamento'}
                              {sync.status === 'error' && 'Erro'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(sync.startTime).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          {sync.endTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Duração: {Math.round((new Date(sync.endTime).getTime() - new Date(sync.startTime).getTime()) / 1000)}s
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {sync.filesProcessed} / {sync.totalFiles} arquivos
                          </p>
                          {sync.status === 'running' && (
                            <Progress 
                              value={(sync.filesProcessed / sync.totalFiles) * 100}
                              className="w-24 mt-1"
                            />
                          )}
                        </div>
                      </div>
                      
                      {sync.errors.length > 0 && (
                        <div className="mt-3 p-2 bg-destructive/10 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-sm font-medium text-destructive">
                              {sync.errors.length} erro(s) encontrado(s)
                            </span>
                          </div>
                          <ul className="text-xs text-destructive space-y-1">
                            {sync.errors.slice(0, 3).map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                            {sync.errors.length > 3 && (
                              <li>• E mais {sync.errors.length - 3} erro(s)...</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};