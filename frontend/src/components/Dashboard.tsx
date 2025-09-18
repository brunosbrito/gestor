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

export const Dashboard = () => {
  // Mock data - in real app this would come from API
  const kpis = [
    {
      title: "Saldo do Contrato",
      value: 2450000,
      format: "currency" as const,
      trend: "neutral" as const,
      icon: <DollarSign className="h-5 w-5 text-primary" />
    },
    {
      title: "Economia Realizada",
      value: "12.5",
      format: "percentage" as const,
      trend: "up" as const,
      trendValue: "+2.1% este mês",
      icon: <TrendingUp className="h-5 w-5 text-success" />
    },
    {
      title: "Meta de Redução",
      value: "85",
      format: "percentage" as const,
      trend: "up" as const,
      trendValue: "Meta: 80%",
      icon: <Target className="h-5 w-5 text-warning" />
    },
    {
      title: "Compras Pendentes",
      value: 23,
      trend: "down" as const,
      trendValue: "-5 esta semana",
      icon: <ShoppingCart className="h-5 w-5 text-accent" />
    }
  ];

  const recentActivities = [
    {
      type: "purchase",
      title: "Compra de Vergalhões - Fornecedor A",
      value: "R$ 85.000",
      time: "2 horas",
      status: "approved"
    },
    {
      type: "contract",
      title: "Novo Contrato - Edifício Comercial SP",
      value: "R$ 1.200.000",
      time: "1 dia",
      status: "active"
    },
    {
      type: "report",
      title: "Relatório Mensal - Agosto 2025",
      value: "Economia 15.2%",
      time: "3 dias",
      status: "completed"
    }
  ];

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
            <div className="space-y-4">
              {[
                { name: "Edifício Residencial - Zona Sul", progress: 65, budget: "R$ 2.4M", spent: "R$ 1.56M" },
                { name: "Complexo Comercial - Centro", progress: 40, budget: "R$ 1.8M", spent: "R$ 720K" },
                { name: "Infraestrutura Urbana - Norte", progress: 85, budget: "R$ 950K", spent: "R$ 807K" }
              ].map((contract, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-foreground">{contract.name}</h4>
                    <span className="text-sm text-muted-foreground">{contract.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${contract.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Orçado: {contract.budget}</span>
                    <span className="text-foreground font-medium">Gasto: {contract.spent}</span>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.status === 'approved' ? 'bg-success/10' :
                    activity.status === 'active' ? 'bg-primary/10' :
                    'bg-muted'
                  }`}>
                    {activity.type === 'purchase' && <ShoppingCart className="h-4 w-4" />}
                    {activity.type === 'contract' && <Building2 className="h-4 w-4" />}
                    {activity.type === 'report' && <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">há {activity.time}</p>
                    <p className="text-xs font-medium text-primary">{activity.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="bg-gradient-card border-0 border-l-4 border-l-warning shadow-card-hover">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <h4 className="font-medium text-foreground">Atenção Necessária</h4>
              <p className="text-sm text-muted-foreground">
                3 contratos próximos ao limite de orçamento e 5 cotações aguardando aprovação da diretoria.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto"
              onClick={() => {
                // Navigate to contracts section
                window.location.hash = '#contracts';
              }}
            >
              Ver Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};