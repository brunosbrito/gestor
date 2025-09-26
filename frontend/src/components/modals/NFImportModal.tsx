import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useImportNFXML, useImportNFBatch, useImportNFPDF } from "@/hooks/useNF";
import { useContracts } from "@/hooks/useContracts";
import { NFImportResult, NotaFiscal, Contract } from "@/types";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Eye,
  Building2,
  FileCheck,
  Loader2
} from "lucide-react";

interface NFImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (result: NFImportResult) => void;
}

export const NFImportModal = ({ open, onOpenChange, onImportComplete }: NFImportModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState<'xml' | 'batch' | 'pdf'>('xml');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<NFImportResult | null>(null);
  const [selectedContract, setSelectedContract] = useState<string>("");
  const [autoClassify, setAutoClassify] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: contracts } = useContracts();
  const importXML = useImportNFXML();
  const importBatch = useImportNFBatch();
  const importPDF = useImportNFPDF();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type based on selected tab
      const validTypes = {
        xml: ['text/xml', 'application/xml'],
        batch: ['application/zip', 'application/x-rar-compressed'],
        pdf: ['application/pdf']
      };
      
      const allowedTypes = validTypes[selectedTab];
      if (!allowedTypes.includes(file.type)) {
        alert(`Por favor, selecione um arquivo válido para ${selectedTab.toUpperCase()}`);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    const onProgress = (progress: number) => setUploadProgress(progress);
    
    try {
      let result;
      switch (selectedTab) {
        case 'xml':
          result = await importXML.mutateAsync({ file: selectedFile, onProgress });
          break;
        case 'batch':
          result = await importBatch.mutateAsync({ file: selectedFile, onProgress });
          break;
        case 'pdf':
          result = await importPDF.mutateAsync({ file: selectedFile, onProgress });
          break;
      }
      
      if (result?.data) {
        setImportResult(result.data);
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleConfirmImport = () => {
    if (importResult && onImportComplete) {
      onImportComplete(importResult);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    setUploadProgress(0);
    setSelectedContract("");
    onOpenChange(false);
  };

  const getFileTypeLabel = () => {
    switch (selectedTab) {
      case 'xml': return 'XML';
      case 'batch': return 'Lote (ZIP)';
      case 'pdf': return 'PDF (OCR)';
    }
  };

  const getFileAccept = () => {
    switch (selectedTab) {
      case 'xml': return '.xml';
      case 'batch': return '.zip,.rar';
      case 'pdf': return '.pdf';
    }
  };

  const isImporting = importXML.isPending || importBatch.isPending || importPDF.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Importar Notas Fiscais
          </DialogTitle>
          <DialogDescription>
            Importe notas fiscais em XML, PDF ou em lote para vinculação com contratos
          </DialogDescription>
        </DialogHeader>

        {!importResult ? (
          <div className="space-y-6">
            {/* Import Type Tabs */}
            <Tabs value={selectedTab} onValueChange={(value: any) => {
              setSelectedTab(value);
              setSelectedFile(null);
            }}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="xml">Arquivo XML</TabsTrigger>
                <TabsTrigger value="batch">Lote ZIP/RAR</TabsTrigger>
                <TabsTrigger value="pdf">PDF (OCR)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="xml" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Importe uma nota fiscal individual em formato XML padrão da SEFAZ
                </div>
              </TabsContent>
              
              <TabsContent value="batch" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Importe múltiplas notas fiscais compactadas em arquivo ZIP ou RAR
                </div>
              </TabsContent>
              
              <TabsContent value="pdf" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Use OCR para extrair dados de notas fiscais em formato PDF (funcionalidade experimental)
                </div>
              </TabsContent>
            </Tabs>

            {/* File Upload Area */}
            <div className="space-y-4">
              <Label>Arquivo da Nota Fiscal ({getFileTypeLabel()})</Label>
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Clique para selecionar ou arraste o arquivo {getFileTypeLabel()} aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  Formato aceito: {getFileAccept()}
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept={getFileAccept()}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              {selectedFile && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-success" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Import Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configurações de Importação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Contrato para Vinculação (Opcional)</Label>
                  <Select value={selectedContract} onValueChange={setSelectedContract}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um contrato ou deixe em branco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum contrato</SelectItem>
                      {contracts?.data.map((contract: Contract) => (
                        <SelectItem key={contract.id} value={contract.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {contract.name} - {contract.client}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="auto-classify"
                    checked={autoClassify}
                    onChange={(e) => setAutoClassify(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="auto-classify">
                    Classificar automaticamente itens por centro de custo
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            {isImporting && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processando arquivo...</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground text-center">
                      {uploadProgress}% concluído
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
              >
                {isImporting ? "Importando..." : `Importar ${getFileTypeLabel()}`}
              </Button>
            </div>
          </div>
        ) : (
          /* Import Results */
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Resumo da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Notas Fiscais</p>
                    <p className="text-2xl font-bold">{importResult.notasFiscais.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">
                      R$ {importResult.notasFiscais.reduce((sum, nf) => sum + nf.valor_total, 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <Separator />

                {/* Status Summary */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-success/10 rounded">
                    <p className="text-sm font-medium text-success">Processadas</p>
                    <p className="text-lg font-bold">
                      {importResult.notasFiscais.filter(nf => nf.status === 'Processada').length}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-warning/10 rounded">
                    <p className="text-sm font-medium text-warning">Pendentes</p>
                    <p className="text-lg font-bold">
                      {importResult.notasFiscais.filter(nf => nf.status === 'Pendente').length}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-destructive/10 rounded">
                    <p className="text-sm font-medium text-destructive">Com Erro</p>
                    <p className="text-lg font-bold">{importResult.errors.length}</p>
                  </div>
                </div>

                {/* Errors and Warnings */}
                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Erros encontrados</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <p key={index} className="text-sm text-destructive ml-6 p-2 bg-destructive/5 rounded">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {importResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-warning">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Avisos</span>
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {importResult.warnings.map((warning, index) => (
                        <p key={index} className="text-sm text-warning ml-6 p-2 bg-warning/5 rounded">
                          {warning}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* NFs Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview das Notas Fiscais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {importResult.notasFiscais.slice(0, 10).map((nf, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            NF {nf.number} - Série {nf.series}
                          </p>
                          <p className="text-xs text-muted-foreground">{nf.supplier}</p>
                          <p className="text-xs text-muted-foreground">
                            {nf.items.length} {nf.items.length === 1 ? 'item' : 'itens'}
                          </p>
                          {selectedContract && (
                            <Badge variant="secondary" className="mt-1">
                              <Building2 className="h-3 w-3 mr-1" />
                              Vinculada ao contrato
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            R$ {nf.valor_total.toLocaleString('pt-BR')}
                          </p>
                          <Badge className={
                            nf.status === 'Processada' ? 'bg-success/10 text-success' :
                            nf.status === 'Pendente' ? 'bg-warning/10 text-warning' :
                            'bg-muted text-muted-foreground'
                          }>
                            {nf.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Items preview */}
                      <div className="mt-2 pl-4 border-l-2 border-muted">
                        {nf.items.slice(0, 3).map((item, itemIndex) => (
                          <div key={itemIndex} className="text-xs text-muted-foreground">
                            {item.description} - R$ {item.totalValue.toLocaleString('pt-BR')}
                          </div>
                        ))}
                        {nf.items.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            ... e mais {nf.items.length - 3} itens
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {importResult.notasFiscais.length > 10 && (
                    <p className="text-center text-sm text-muted-foreground">
                      ... e mais {importResult.notasFiscais.length - 10} notas fiscais
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
              <Button 
                onClick={handleConfirmImport}
                disabled={importResult.errors.length > 0}
                className="gap-2"
              >
                <FileCheck className="h-4 w-4" />
                Confirmar Importação
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};