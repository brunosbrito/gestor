import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Activity,
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp,
  Receipt,
  Link,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { useNFs, useValidateNFNew } from "@/hooks/useNF";
import { NFToBudgetLinkingModal } from "@/components/modals/NFToBudgetLinkingModal";
import { useContracts, useContractRealizedValue } from "@/hooks/useContracts";
import { formatCurrency, cn } from "@/lib/utils";

interface ExecutionDashboardProps {
  contractId: number;
}


export const ExecutionDashboard = ({ contractId }: ExecutionDashboardProps) => {
  const [showAlerts, setShowAlerts] = useState(true);

  // Usar dados reais das APIs
  const { data: contracts } = useContracts();
  const contractData = contracts?.data?.contracts?.find(c => c.id === contractId);
  const { data: nfs } = useNFs(contractId);
  const { data: realizedValue, isLoading: realizingLoading, refetch } = useContractRealizedValue(contractId);
  const validateNF = useValidateNFNew();

  const executionData = realizedValue?.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'over_budget': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'over_budget': return 'Acima do Orçamento';
      case 'in_progress': return 'Em Andamento';
      case 'not_started': return 'Não Iniciado';
      default: return 'Desconhecido';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'budget_exceeded': return <AlertTriangle className="h-4 w-4" />;
      case 'variance_high': return <TrendingUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const handleRecalculate = () => {
    refetch();
  };

  if (realizingLoading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
          <p className="text-muted-foreground">
            Carregando dados de realização...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!executionData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Dados de realização não disponíveis
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Certifique-se de que existem notas fiscais validadas para este contrato
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Dashboard de Realização</h3>
          <p className="text-sm text-muted-foreground">
            {contractData?.name || `Contrato ${contractId}`} • Comparativo Previsto vs Realizado
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRecalculate}
          disabled={realizingLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${realizingLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Execution Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Orçado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(executionData.valor_original)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(executionData.valor_realizado)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {executionData.nfs_validadas} de {executionData.total_nfs} NFs validadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              executionData.saldo_restante < 0 ? 'text-destructive' : 'text-success'
            }`}>
              {formatCurrency(Math.abs(executionData.saldo_restante))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {executionData.saldo_restante < 0 ? 'Excedente' : 'Disponível'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">% Executado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              executionData.percentual_realizado > 100 ? 'text-destructive' : 'text-foreground'
            }`}>
              {executionData.percentual_realizado.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {executionData.percentual_realizado > 100 ? 'Acima do orçamento' : 'Dentro do orçamento'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {executionData.alerts.length > 0 && showAlerts && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Realização
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAlerts(false)}
              >
                Ocultar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {executionData.alerts.map(alert => (
                <Alert key={alert.id} className={
                  alert.severity === 'high' ? 'border-red-200 bg-red-50' :
                  alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }>
                  {getAlertIcon(alert.type)}
                  <AlertDescription className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <Badge variant="outline" className={
                      alert.severity === 'high' ? 'text-red-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }>
                      {alert.severity === 'high' ? 'Alto' : 
                       alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unlinked NFs Alert */}
      {executionData.nfs_nao_validadas && executionData.nfs_nao_validadas > 0 && (
        <Alert>
          <Receipt className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {executionData.nfs_nao_validadas} Nota(s) Fiscal(is) aguardando validação
              </span>
              <Button variant="outline" size="sm">
                <Link className="h-4 w-4 mr-2" />
                Validar Agora
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Notas Fiscais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas Fiscais Validadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4" />
            <p>Visualização detalhada das notas fiscais</p>
            <p className="text-sm mt-2">
              Para ver os itens detalhados das notas fiscais, acesse o módulo de "Importação de NFs"
            </p>
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>{executionData.nfs_validadas} NFs Validadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span>{executionData.total_nfs} NFs Total</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => window.location.href = '/nf-import'}
            >
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="h-4 w-4" />
                <span className="font-medium">Processar NFs</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Importar e validar novas notas fiscais
              </p>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Relatório Detalhado</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Gerar relatório completo de realização
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};