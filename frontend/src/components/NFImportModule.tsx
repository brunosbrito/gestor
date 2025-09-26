import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNFs,
  useNFStats,
  useValidateNFNew,
  useRejectNF,
  useAssociateContract,
  useProcessFolder,
  useProcessingLogs,
  useNFsByFolder
} from "@/hooks/useNF";
import { useContracts } from "@/hooks/useContracts";
import { MetricCard } from "@/components/MetricCard";
import { NFImportModal } from "@/components/modals/NFImportModal";
import {
  FileText,
  Upload,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  FileCheck,
  Search,
  Filter,
  Plus,
  Activity,
  RefreshCw
} from "lucide-react";

export const NFImportModule = () => {
  const [selectedContractId, setSelectedContractId] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [folderName, setFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [showProcessingLogs, setShowProcessingLogs] = useState(false);

  const { data: nfStats, isLoading: statsLoading } = useNFStats();
  const { data: nfs, isLoading: nfsLoading } = useNFs(selectedContractId);
  const { data: contracts } = useContracts();
  const { data: processingLogs, isLoading: logsLoading } = useProcessingLogs();
  const { data: folderNFs, isLoading: folderNFsLoading } = useNFsByFolder(
    selectedFolder,
    0,
    50
  );

  const processFolder = useProcessFolder();
  const validateNF = useValidateNFNew();
  const rejectNF = useRejectNF();
  const associateContract = useAssociateContract();

  const handleProcessFolder = () => {
    if (!folderName.trim()) {
      return;
    }
    processFolder.mutate(folderName.trim());
    setFolderName("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validada':
      case 'Processada':
        return 'bg-success/10 text-success';
      case 'Pendente':
        return 'bg-warning/10 text-warning';
      case 'Rejeitada':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Importação de Notas Fiscais</h1>
          <p className="text-muted-foreground">
            Importe e gerencie notas fiscais do sistema
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Search className="h-4 w-4" />
            Buscar NFs
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button onClick={() => setImportModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Importação
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total de NFs"
          value={nfStats?.data.total || 0}
          format="number"
          icon={<FileText className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Pendentes"
          value={nfStats?.data.pending || 0}
          format="number"
          icon={<AlertCircle className="h-5 w-5 text-warning" />}
        />
        <MetricCard
          title="Validadas"
          value={nfStats?.data.validated || 0}
          format="number"
          icon={<CheckCircle className="h-5 w-5 text-success" />}
        />
        <MetricCard
          title="Valor Total"
          value={nfStats?.data.totalValue || 0}
          format="currency"
          icon={<FileCheck className="h-5 w-5 text-accent" />}
        />
      </div>

      {/* Process Folder Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Processar Pasta de NFs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Digite o nome da pasta contendo os arquivos de notas fiscais.
              O n8n irá processar automaticamente todos os arquivos da pasta.
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Nome da pasta..."
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !processFolder.isPending) {
                    handleProcessFolder();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleProcessFolder}
                disabled={processFolder.isPending || !folderName.trim()}
              >
                {processFolder.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Processar
              </Button>
            </div>
            {processFolder.isPending && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Enviando para n8n...
                </p>
                <Progress value={100} className="animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Logs de Processamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Acompanhe o status do processamento das pastas pelo n8n
            </p>
            <div className="space-y-2">
              {logsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                </div>
              ) : (
                processingLogs?.data.logs.slice(0, 3).map((log) => (
                  <div key={log.id} className="p-2 bg-muted/30 rounded text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{log.pasta_nome}</span>
                      <Badge variant={
                        log.status === 'concluido' ? 'default' :
                        log.status === 'erro' ? 'destructive' :
                        'secondary'
                      }>
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {log.mensagem || 'Processando...'}
                    </p>
                  </div>
                ))
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => setShowProcessingLogs(!showProcessingLogs)}
            >
              Ver Todos os Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Folder Filter Section */}
      {processingLogs?.data.logs.length > 0 && (
        <Card className="bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Visualizar por Subpasta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Filtre e visualize as notas fiscais processadas por subpasta específica
            </p>
            <div className="flex gap-2 flex-wrap">
              <Input
                type="text"
                placeholder="Nome da pasta ou subpasta..."
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="flex-1 min-w-0"
              />
              <Button
                variant="outline"
                onClick={() => setSelectedFolder("")}
                disabled={!selectedFolder}
              >
                Limpar
              </Button>
            </div>

            {selectedFolder && folderNFs?.data && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium">
                    Pasta: {folderNFs.data.folder_name} ({folderNFs.data.total} NFs)
                  </p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {folderNFsLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : (
                    folderNFs.data.nfs.map((nf) => (
                      <div key={nf.id} className="p-3 bg-muted/20 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">
                              NF {nf.numero} - {nf.nome_fornecedor}
                            </p>
                            {nf.subpasta && (
                              <p className="text-xs text-muted-foreground">
                                Subpasta: {nf.subpasta}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              R$ {nf.valor_total.toLocaleString('pt-BR')}
                            </p>
                            <Badge variant={
                              nf.status_processamento === 'validado' ? 'default' :
                              nf.status_processamento === 'erro' ? 'destructive' :
                              'secondary'
                            }>
                              {nf.status_processamento}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {nf.status_processamento === 'processado' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => validateNF.mutate(nf.id)}
                              disabled={validateNF.isPending}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Validar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* Navigate to NF details */}}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* NFs List */}
      <Card className="bg-gradient-card border-0 shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notas Fiscais Importadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nfsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {nfs?.data.map((nf) => (
                <div key={nf.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        NF {nf.number} - Série {nf.series}
                      </h3>
                      <p className="text-sm text-muted-foreground">{nf.supplier}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {nf.contract || 'Sem contrato associado'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        R$ {nf.valor_total.toLocaleString('pt-BR')}
                      </p>
                      <Badge className={getStatusColor(nf.status)}>
                        {nf.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(nf.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {/* View details logic */}}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Detalhes
                    </Button>
                    
                    {(nf.status === 'Pendente' || nf.status === 'processado') && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => validateNF.mutate(nf.id)}
                          disabled={validateNF.isPending}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Validar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const reason = prompt('Motivo da rejeição:');
                            if (reason) rejectNF.mutate({ id: nf.id, reason });
                          }}
                          disabled={rejectNF.isPending}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejeitar
                        </Button>
                      </>
                    )}
                    
                    {nf.status === 'Validada' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => processNF.mutate(nf.id)}
                        disabled={processNF.isPending}
                      >
                        <FileCheck className="h-3 w-3 mr-1" />
                        Processar
                      </Button>
                    )}
                    
                    {nf.xmlFile && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {/* Download XML logic */}}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        XML
                      </Button>
                    )}
                    
                    {nf.pdfFile && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {/* Download PDF logic */}}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Logs Modal */}
      {showProcessingLogs && processingLogs?.data && (
        <Card className="bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Histórico Completo de Processamento
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProcessingLogs(false)}
              >
                Fechar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {processingLogs.data.logs.map((log) => (
                <div key={log.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{log.pasta_nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.webhook_chamado_em).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant={
                      log.status === 'concluido' ? 'default' :
                      log.status === 'erro' ? 'destructive' :
                      'secondary'
                    }>
                      {log.status}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <p className="mb-1">{log.mensagem}</p>
                    {log.quantidade_nfs && (
                      <p className="text-muted-foreground">
                        {log.quantidade_nfs} NFs processadas • {log.quantidade_arquivos} arquivos
                      </p>
                    )}
                    {log.detalhes_erro && (
                      <p className="text-destructive mt-2">
                        Erro: {log.detalhes_erro}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};