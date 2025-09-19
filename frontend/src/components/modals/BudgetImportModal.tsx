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
import { useBudgetImport } from "@/hooks/useBudgetImport";
import { BudgetImportResult } from "@/types";
import { budgetService } from "@/services/budgetService";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";

interface BudgetImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (result: BudgetImportResult) => void;
}

export const BudgetImportModal = ({ open, onOpenChange, onImportComplete }: BudgetImportModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importSpreadsheet, isImporting, importResult, clearImport } = useBudgetImport();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar se é arquivo Excel com extensão válida
      if (!budgetService.isValidExcelFile(file.name)) {
        alert('Por favor, selecione um arquivo Excel (.xlsx, .xls, .xlsm) com sheet QQP_Cliente');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importSpreadsheet(selectedFile);
    }
  };

  const handleConfirmImport = () => {
    if (importResult) {
      onImportComplete(importResult);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    clearImport();
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Orçamento Previsto
          </DialogTitle>
          <DialogDescription>
            Importe a planilha de composição de custos (aba QQP Cliente)
          </DialogDescription>
        </DialogHeader>

        {!importResult ? (
          <div className="space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <Label>Arquivo da Planilha</Label>
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Clique para selecionar ou arraste o arquivo aqui
                </p>
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: .xlsx, .xls, .xlsm (deve conter sheet "QQP_Cliente")
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.xlsm"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              
              {selectedFile && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-8 w-8 text-success" />
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

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Instruções</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Obrigatório:</strong> Arquivo deve conter sheet "QQP_Cliente"</p>
                <p>• Valor total extraído automaticamente da célula específica</p>
                <p>• Itens importados das linhas 11-21 da planilha</p>
                <p>• Colunas: Item, Serviços, Unidade, Qtd Mensal, Duração Meses, Preço Total, Observação</p>
                <p>• Qualquer nome de arquivo aceito (desde que tenha a sheet correta)</p>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
              >
                {isImporting ? "Importando..." : "Importar Planilha"}
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
                    <p className="text-sm text-muted-foreground">Itens Importados</p>
                    <p className="text-2xl font-bold">{importResult.imported_items}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total do Contrato</p>
                    <p className="text-2xl font-bold">
                      R$ {importResult.contract_total_value.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Valor dos Itens</p>
                  <Badge variant="secondary" className="text-sm">
                    R$ {importResult.items_total.toLocaleString('pt-BR')}
                  </Badge>
                </div>

                {/* Errors and Warnings */}
                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Erros encontrados</span>
                    </div>
                    {importResult.errors.map((error, index) => (
                      <p key={index} className="text-sm text-destructive ml-6">{error}</p>
                    ))}
                  </div>
                )}

                {importResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-warning">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Avisos</span>
                    </div>
                    {importResult.warnings.map((warning, index) => (
                      <p key={index} className="text-sm text-warning ml-6">{warning}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview dos Itens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {importResult.valores_previstos.slice(0, 5).map((item, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.servicos}</p>
                          <p className="text-xs text-muted-foreground">Item: {item.item}</p>
                          {item.unidade && (
                            <p className="text-xs text-muted-foreground">
                              Unidade: {item.unidade}
                            </p>
                          )}
                          {item.qtd_mensal && (
                            <p className="text-xs text-muted-foreground">
                              Qtd Mensal: {item.qtd_mensal}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            R$ {item.preco_total.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {importResult.valores_previstos.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground">
                      ... e mais {importResult.valores_previstos.length - 5} itens
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmImport}
                disabled={importResult.errors.length > 0}
              >
                Confirmar Importação
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};