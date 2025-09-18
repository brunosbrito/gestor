import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useNFs, useNFStats, useImportNFXML, useImportNFBatch, useImportNFPDF, useValidateNF, useRejectNF, useAssociateContract, useProcessNF } from "@/hooks/useNF";
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
  Plus
} from "lucide-react";

export const NFImportModule = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedContractId, setSelectedContractId] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [importModalOpen, setImportModalOpen] = useState(false);

  const { data: nfStats, isLoading: statsLoading } = useNFStats();
  const { data: nfs, isLoading: nfsLoading } = useNFs(selectedContractId);
  const { data: contracts } = useContracts();
  
  const importXML = useImportNFXML();
  const importBatch = useImportNFBatch();
  const importPDF = useImportNFPDF();
  const validateNF = useValidateNF();
  const rejectNF = useRejectNF();
  const associateContract = useAssociateContract();
  const processNF = useProcessNF();

  const handleFileUpload = (file: File, type: 'xml' | 'batch' | 'pdf') => {
    const onProgress = (progress: number) => setUploadProgress(progress);
    
    switch (type) {
      case 'xml':
        importXML.mutate({ file, onProgress });
        break;
      case 'batch':
        importBatch.mutate({ file, onProgress });
        break;
      case 'pdf':
        importPDF.mutate({ file, onProgress });
        break;
    }
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

      {/* Import Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar XML
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Importe notas fiscais individuais em formato XML
            </p>
            <Input
              type="file"
              accept=".xml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'xml');
              }}
              className="mb-4"
            />
            {importXML.isPending && (
              <Progress value={uploadProgress} className="mb-2" />
            )}
            <Button 
              className="w-full" 
              disabled={importXML.isPending}
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
            >
              Selecionar Arquivo XML
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importação em Lote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Importe múltiplas NFs compactadas em ZIP
            </p>
            <Input
              type="file"
              accept=".zip,.rar"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'batch');
              }}
              className="mb-4"
            />
            {importBatch.isPending && (
              <Progress value={uploadProgress} className="mb-2" />
            )}
            <Button 
              className="w-full" 
              disabled={importBatch.isPending}
            >
              Selecionar Arquivo ZIP
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              OCR de PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Extraia dados de NFs em formato PDF usando OCR
            </p>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'pdf');
              }}
              className="mb-4"
            />
            {importPDF.isPending && (
              <Progress value={uploadProgress} className="mb-2" />
            )}
            <Button 
              className="w-full" 
              disabled={importPDF.isPending}
            >
              Selecionar PDF
            </Button>
          </CardContent>
        </Card>
      </div>

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
                        R$ {nf.value.toLocaleString('pt-BR')}
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
                    
                    {nf.status === 'Pendente' && (
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

      {/* Import Modal */}
      <NFImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImportComplete={(result) => {
          console.log('Import completed:', result);
          // Refresh NF lists
          // This will be handled automatically by React Query invalidation
        }}
      />
    </div>
  );
};