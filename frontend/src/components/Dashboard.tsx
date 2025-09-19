import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  Target,
  ShoppingCart,
  FileText,
  Clock,
  AlertTriangle,
  Building2
} from "lucide-react";
import { useDashboardKPIs, useActiveContracts, useRecentActivities, useDashboardAlerts } from "@/hooks/useDashboard";

export const Dashboard = () => {
  const { data: kpisData, isLoading: kpisLoading } = useDashboardKPIs();
  const { data: contractsData, isLoading: contractsLoading } = useActiveContracts();
  const { data: activitiesData, isLoading: activitiesLoading } = useRecentActivities(3);
  const { data: alertsData, isLoading: alertsLoading } = useDashboardAlerts();

  const kpis = kpisData?.data ? [
    {
      title: "Saldo do Contrato",
      value: kpisData.data.contractBalance,
      format: "currency" as const,
      trend: "neutral" as const,
      icon: <DollarSign className="h-5 w-5 text-primary" />
    },
    {
      title: "Economia Realizada",
      value: kpisData.data.realizedSavings.toString(),
      format: "percentage" as const,
      trend: "up" as const,
      trendValue: "+2.1% este mês",
      icon: <TrendingUp className="h-5 w-5 text-success" />
    },
    {
      title: "Meta de Redução",
      value: kpisData.data.reductionTarget.toString(),
      format: "percentage" as const,
      trend: "up" as const,
      trendValue: "Meta: 80%",
      icon: <Target className="h-5 w-5 text-warning" />
    },
    {
      title: "Compras Pendentes",
      value: kpisData.data.pendingPurchases,
      trend: "down" as const,
      trendValue: "-5 esta semana",
      icon: <ShoppingCart className="h-5 w-5 text-accent" />
    }
  ] : [];

  const contracts = contractsData?.data?.contracts || [];
  const recentActivities = activitiesData?.data || [];
  const alerts = alertsData?.data || [];

  console.log('🏠 Dashboard - Data received:', {
    contractsData,
    contracts,
    contractsCount: contracts.length,
    contractsLoading,
    activitiesData,
    alertsData
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão geral dos indicadores de custos e performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => {
              // Navigate to reports section
              window.location.hash = '#reports';
            }}
          >
            <FileText className="h-4 w-4" />
            Gerar Relatório
          </Button>
          <Button 
            variant="premium"
            onClick={() => {
              // Navigate to analytics section
              window.location.hash = '#analytics';
            }}
          >
            <TrendingUp className="h-4 w-4" />
            Ver Analytics
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <MetricCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            format={kpi.format}
            trend={kpi.trend}
            trendValue={kpi.trendValue}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contract Status */}
        <Card className="lg:col-span-2 bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Contratos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-muted/30 rounded-lg animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-2 bg-muted rounded mb-2"></div>
                    <div className="flex justify-between">
                      <div className="h-3 w-20 bg-muted rounded"></div>
                      <div className="h-3 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract, index) => {
                  // Verificações de segurança para o dashboard
                  const contractValue = typeof contract.value === 'number' ? contract.value : 0;
                  const contractSpent = typeof contract.spent === 'number' ? contract.spent : 0;
                  const contractProgress = typeof contract.progress === 'number' ? Math.min(contract.progress, 100) : 0;
                  const contractName = contract.name || 'Nome não disponível';

                  return (
                    <div key={contract.id || index} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-foreground">{contractName}</h4>
                        <span className="text-sm text-muted-foreground">{contractProgress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${contractProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Orçado: R$ {contractValue.toLocaleString('pt-BR')}</span>
                        <span className="text-foreground font-medium">Gasto: R$ {contractSpent.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  );
                })}
                {contracts.length === 0 && !contractsLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum contrato ativo encontrado
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded mb-1"></div>
                      <div className="h-2 bg-muted rounded mb-1 w-2/3"></div>
                      <div className="h-2 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'purchase' ? 'bg-success/10' :
                      activity.type === 'contract' ? 'bg-primary/10' :
                      activity.type === 'report' ? 'bg-accent/10' :
                      'bg-muted'
                    }`}>
                      {activity.type === 'purchase' && <ShoppingCart className="h-4 w-4" />}
                      {activity.type === 'contract' && <Building2 className="h-4 w-4" />}
                      {activity.type === 'report' && <FileText className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp ? new Date(activity.timestamp).toLocaleString('pt-BR') : 'Data não disponível'}</p>
                      {activity.metadata && (
                        <p className="text-xs font-medium text-primary">{activity.metadata}</p>
                      )}
                    </div>
                  </div>
                ))}
                {recentActivities.length === 0 && !activitiesLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma atividade recente encontrada
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alertsLoading ? (
        <Card className="bg-gradient-card border-0 border-l-4 border-l-warning shadow-card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 bg-muted rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
              <div className="w-20 h-8 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      ) : alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <Card key={alert.id || index} className={`bg-gradient-card border-0 border-l-4 shadow-card-hover ${
              alert.priority === 'high' ? 'border-l-destructive' :
              alert.priority === 'medium' ? 'border-l-warning' :
              'border-l-primary'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${
                    alert.priority === 'high' ? 'text-destructive' :
                    alert.priority === 'medium' ? 'text-warning' :
                    'text-primary'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                  {alert.actionUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.hash = alert.actionUrl!;
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
};