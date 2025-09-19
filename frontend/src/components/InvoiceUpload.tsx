import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileArchive,
  Link,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Calendar,
  DollarSign,
  Building,
  Loader2
} from "lucide-react";
import {
  useContractInvoices,
  useContractInvoicesSummary,
  useUploadInvoicesZip,
  useProcessOneDriveUrl,
  useDeleteInvoice
} from "@/hooks/useInvoices";
import { invoiceService } from "@/services/invoiceService";
import { Invoice } from "@/types";

interface InvoiceUploadProps {
  contractId: number;
}

export const InvoiceUpload = ({ contractId }: InvoiceUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [oneDriveUrl, setOneDriveUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { data: invoicesData } = useContractInvoices(contractId);
  const { data: summaryData } = useContractInvoicesSummary(contractId);
  const uploadZipMutation = useUploadInvoicesZip();
  const processOneDriveMutation = useProcessOneDriveUrl();
  const deleteInvoiceMutation = useDeleteInvoice();

  const invoices = invoicesData?.data || [];
  const summary = summaryData?.data;

  // File upload handlers
  const handleFileSelect = (file: File) => {
    setFileError(null);

    if (!invoiceService.isValidZipFile(file.name)) {
      setFileError("Arquivo deve ser do tipo ZIP");
      return;
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setFileError("Arquivo muito grande. Máximo permitido: 100MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // OneDrive URL handlers
  const handleOneDriveUrlChange = (url: string) => {
    setUrlError(null);
    setOneDriveUrl(url);

    if (url && !invoiceService.isValidOneDriveUrl(url)) {
      setUrlError("URL deve ser de uma pasta do OneDrive/SharePoint");
    }
  };

  // Upload handlers
  const handleUploadZip = () => {
    if (selectedFile) {
      uploadZipMutation.mutate({ contractId, file: selectedFile });
    }
  };

  const handleProcessOneDrive = () => {
    if (oneDriveUrl && !urlError) {
      processOneDriveMutation.mutate({ contractId, folderUrl: oneDriveUrl });
    }
  };

  const handleDeleteInvoice = (invoiceId: number) => {
    if (confirm("Tem certeza que deseja remover esta nota fiscal?")) {
      deleteInvoiceMutation.mutate(invoiceId);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total de Notas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_invoices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(summary.total_value)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Última Atualização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {summary.recent_invoices.length > 0
                  ? formatDate(summary.recent_invoices[0].created_at!)
                  : "Nenhuma nota fiscal"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Notas Fiscais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ZIP Upload */}
          <div className="space-y-4">
            <Label>Arquivo ZIP com Notas Fiscais</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              } ${fileError ? "border-destructive" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileArchive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste um arquivo ZIP aqui ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                Formato aceito: .zip (máximo 100MB)
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <FileArchive className="h-8 w-8 text-success" />
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {fileError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleUploadZip}
              disabled={!selectedFile || uploadZipMutation.isPending}
              className="w-full"
            >
              {uploadZipMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload do ZIP
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OU</span>
            </div>
          </div>

          {/* OneDrive URL */}
          <div className="space-y-4">
            <Label>URL da Pasta do OneDrive</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://onedrive.live.com/..."
                value={oneDriveUrl}
                onChange={(e) => handleOneDriveUrlChange(e.target.value)}
                className={urlError ? "border-destructive" : ""}
              />
              <Button
                onClick={handleProcessOneDrive}
                disabled={!oneDriveUrl || !!urlError || processOneDriveMutation.isPending}
                variant="outline"
              >
                {processOneDriveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link className="h-4 w-4" />
                )}
              </Button>
            </div>

            {urlError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{urlError}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notas Fiscais Processadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Número NF</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead>Data Emissão</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {invoice.numero_nf}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {invoice.fornecedor || "Não informado"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(invoice.valor_total)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.data_emissao)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {invoice.items_count || 0} {invoice.items_count === 1 ? "item" : "itens"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          disabled={deleteInvoiceMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma nota fiscal foi processada ainda
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Faça upload de um arquivo ZIP ou forneça uma URL do OneDrive
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};