import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  Folder,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  FileText,
} from "lucide-react";
import { useProcessFolder, useProcessingLogs } from "@/hooks/useNotasFiscais";

interface ImportNFTabProps {
  contractId: number;
  contractName: string;
}

export const ImportNFTab: React.FC<ImportNFTabProps> = ({
  contractId,
  contractName,
}) => {
  const [folderName, setFolderName] = useState("");
  const processFolder = useProcessFolder();
  const { data: logsData, refetch: refetchLogs } = useProcessingLogs(0, 5);

  const handleProcessFolder = async () => {
    if (!folderName.trim()) {
      return;
    }

    const webhookUrl = "https://n8n.gmxindustrial.com.br/webhook/nome_pasta";
    const payload = {
    folder: folderName,
    status: 'iniciado'
  };

    try {
      const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    } catch (error) {
      console.error("Erro ao processar pasta:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sucesso":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sucesso
          </Badge>
        );
      case "processando":
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processando
          </Badge>
        );
      case "erro":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const recentLogs = logsData?.data?.logs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Importar Notas Fiscais
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Processe uma pasta do OneDrive/Google Drive para importar notas
            fiscais e vinculá-las ao contrato <strong>{contractName}</strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nome da Pasta</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Folder className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="folder-name"
                    placeholder="Digite o nome da pasta (ex: NFs_Contrato_001)"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="pl-10"
                    disabled={processFolder.isPending}
                  />
                </div>
                <Button
                  onClick={handleProcessFolder}
                  disabled={!folderName.trim() || processFolder.isPending}
                  className="min-w-[120px]"
                >
                  {processFolder.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Puxar NFs
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {processFolder.isSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Solicitação de processamento enviada com sucesso! As notas
                fiscais serão processadas em alguns minutos.
              </AlertDescription>
            </Alert>
          )}

          {processFolder.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao processar pasta: {processFolder.error.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Organize suas NFs em uma pasta</p>
                <p className="text-muted-foreground">
                  Coloque todos os arquivos XML das notas fiscais em uma pasta
                  específica no OneDrive ou Google Drive.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Digite o nome exato da pasta</p>
                <p className="text-muted-foreground">
                  Certifique-se de que o nome da pasta esteja correto e coincida
                  com a pasta no seu drive.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Clique em "Puxar NFs"</p>
                <p className="text-muted-foreground">
                  O sistema processará automaticamente todos os arquivos e
                  importará as notas fiscais.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Processing Logs */}
      {recentLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Histórico de Processamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log, index) => (
                <div
                  key={log.id || index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{log.pasta_nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.webhook_chamado_em).toLocaleString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.quantidade_nfs && (
                      <span className="text-xs text-muted-foreground">
                        {log.quantidade_nfs} NFs
                      </span>
                    )}
                    {getStatusBadge(log.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhook Info */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p>
              <strong>Webhook URL:</strong>
            </p>
            <code className="block bg-background p-2 rounded text-xs">
              https://n8n.gmxindustrial.com.br/webhook/nome_pasta/
              {folderName || "{nome_pasta}"}
            </code>
            <p className="text-muted-foreground">
              O sistema utilizará este webhook para processar as notas fiscais
              automaticamente via n8n.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
