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
import { useContractExecution, useUnlinkedNFs, useRecalculateExecution } from "@/hooks/useRealization";
import { useNFs } from "@/hooks/useNF";
import { NFToBudgetLinkingModal } from "@/components/modals/NFToBudgetLinkingModal";
import { useContracts } from "@/hooks/useContracts";
import { formatCurrency, cn } from "@/lib/utils";

interface ExecutionDashboardProps {
  contractId: number;
}

// Mock data para demonstração
const mockExecutionData = {
  contractId: 1,
  totalPredictedValue: 2400000,
  totalRealizedValue: 1850000,
  physicalProgress: 75,
  financialProgress: 77,
  lastUpdate: "2024-01-15T10:30:00Z",
  alerts: [
    {
      id: "1",
      type: "variance_high" as const,
      severity: "medium" as const,
      message: "Item 'Estrutura Metálica' apresenta variação de +15% no valor realizado",
      budgetItemId: "item-001"
    },
    {
      id: "2", 
      type: "budget_exceeded" as const,
      severity: "high" as const,
      message: "Item 'Acabamento' excedeu o orçamento previsto em R$ 45.000",
      budgetItemId: "item-002"
    }
  ],
  items: [
    {
      budgetItemId: "item-001",
      predictedValue: 500000,
      realizedValue: 575000,
      predictedQuantity: 100,
      realizedQuantity: 100,
      variance: 75000,
      variancePercent: 15,
      status: "completed" as const,
      linkedNFs: [
        {
          nfId: 1,
          nfItemId: 1,
          value: 575000,
          quantity: 100,
          date: "2024-01-10"
        }
      ]
    },
    {
      budgetItemId: "item-002", 
      predictedValue: 300000,
      realizedValue: 345000,
      predictedQuantity: 50,
      realizedQuantity: 52,
      variance: 45000,
      variancePercent: 15,
      status: "over_budget" as const,
      linkedNFs: [
        {
          nfId: 2,
          nfItemId: 3,
          value: 200000,
          quantity: 30,
          date: "2024-01-12"
        },
        {
          nfId: 3,
          nfItemId: 2,
          value: 145000,
          quantity: 22,
          date: "2024-01-14"
        }
      ]
    }
  ]
};

export const ExecutionDashboard = ({ contractId }: ExecutionDashboardProps) => {
  const [showAlerts, setShowAlerts] = useState(true);
  
  // Usando dados mock por enquanto
  const executionData = mockExecutionData;
  const { data: contracts } = useContracts();
  const contractData = contracts?.data?.find(c => c.id === contractId);
  const { data: nfs } = useNFs(contractId);
  const { data: unlinkedNFs } = useUnlinkedNFs(contractId);
  const unlinkedNFsData = unlinkedNFs?.data;
  const recalculateMutation = useRecalculateExecution();

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
    recalculateMutation.mutate(contractId);
  };

  if (!executionData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Dados de realização não disponíveis
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
            Comparativo Previsto vs Realizado • Atualizado: {new Date(executionData.lastUpdate).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRecalculate}
          disabled={recalculateMutation.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
          Recalcular
        </Button>
      </div>

      {/* Execution Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Previsto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(executionData.totalPredictedValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(executionData.totalRealizedValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              executionData.totalRealizedValue > executionData.totalPredictedValue 
                ? 'text-red-600' 
                : 'text-green-600'
            }`}>
              {executionData.totalRealizedValue > executionData.totalPredictedValue ? '+' : ''}
              {formatCurrency(executionData.totalRealizedValue - executionData.totalPredictedValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">% Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((executionData.totalRealizedValue / executionData.totalPredictedValue) * 100).toFixed(1)}%
            </div>
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
      {unlinkedNFsData && unlinkedNFsData.length > 0 && (
        <Alert>
          <Receipt className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {unlinkedNFsData.length} Nota(s) Fiscal(is) não vinculada(s) ao orçamento
              </span>
              <Button variant="outline" size="sm">
                <Link className="h-4 w-4 mr-2" />
                Vincular Agora
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Execution Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens de Realização</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {executionData.items.map(item => {
                const budgetItem = contractData?.predictedBudget?.find(b => b.id === item.budgetItemId);
                
                return (
                  <div key={item.budgetItemId} className="p-4 border rounded-lg space-y-4">
                    {/* Item Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{budgetItem?.description || `Item ${item.budgetItemId}`}</h4>
                        <p className="text-sm text-muted-foreground">
                          {budgetItem?.category}
                        </p>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>

                    {/* Values Comparison */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Previsto</p>
                        <p className="font-medium">{formatCurrency(item.predictedValue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Realizado</p>
                        <p className="font-medium">{formatCurrency(item.realizedValue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Variação</p>
                        <p className={`font-medium ${item.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)}
                          <span className="text-xs ml-1">
                            ({item.variancePercent > 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{((item.realizedValue / item.predictedValue) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(item.realizedValue / item.predictedValue) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Linked NFs */}
                    {item.linkedNFs.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Notas Fiscais Vinculadas:</p>
                        <div className="space-y-1">
                          {item.linkedNFs.map(nf => (
                            <div key={`${nf.nfId}-${nf.nfItemId}`} className="text-xs p-2 bg-muted/30 rounded">
                              NF {nf.nfId} • {formatCurrency(nf.value)} • {new Date(nf.date).toLocaleDateString('pt-BR')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Link className="h-4 w-4" />
                <span className="font-medium">Vincular NFs</span>
              </div>
              <p className="text-xs text-muted-foreground text-left">
                Associar notas fiscais aos itens do orçamento
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