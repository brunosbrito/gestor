import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { BarChart3, TrendingUp, PieChart, Activity, Download } from "lucide-react";

export const AnalyticsModule = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Avançado</h1>
          <p className="text-muted-foreground">
            Análises profundas e insights de performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Exportar Dados
          </Button>
          <Button variant="premium">
            <BarChart3 className="h-4 w-4" />
            Dashboard Executivo
          </Button>
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="ROI Médio dos Projetos"
          value="18.5"
          format="percentage"
          trend="up"
          trendValue="+2.1% vs trimestre anterior"
          icon={<TrendingUp className="h-5 w-5 text-success" />}
        />
        <MetricCard
          title="Tempo Médio de Cotação"
          value="3.2"
          trend="down"
          trendValue="-0.8 dias otimizado"
          icon={<Activity className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Fornecedores Ativos"
          value="47"
          trend="up"
          trendValue="+5 este mês"
          icon={<PieChart className="h-5 w-5 text-accent" />}
        />
        <MetricCard
          title="Economia Acumulada"
          value="15.2"
          format="percentage"
          trend="up"
          trendValue="Meta anual: 12%"
          icon={<BarChart3 className="h-5 w-5 text-warning" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Evolution Chart */}
        <Card className="bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução de Custos (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Gráfico de Evolução de Custos</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Implementação futura com biblioteca de charts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Performance */}
        <Card className="bg-gradient-card border-0 shadow-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Performance por Fornecedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Distribuição por Fornecedor</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Chart com ranking de fornecedores
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-0 shadow-card-hover border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights Positivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-success rounded-full mt-2" />
                <span>Fornecedor "Siderúrgica Nacional" apresentou 15% de economia nas últimas compras</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-success rounded-full mt-2" />
                <span>Tempo médio de cotação reduziu 25% com o novo processo digital</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-success rounded-full mt-2" />
                <span>Meta de redução de custos sendo superada em 3 dos 4 contratos ativos</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-hover border-l-4 border-l-warning">
          <CardHeader>
            <CardTitle className="text-warning flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Pontos de Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                <span>Contrato "Infraestrutura Urbana" próximo ao limite de orçamento (85%)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                <span>5 cotações aguardando aprovação há mais de 3 dias</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                <span>Fornecedor "Madeireira SP" com atrasos recorrentes nas entregas</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="bg-gradient-card border-0 shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Recomendações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-medium text-primary mb-2">Renegociação Sugerida</h4>
              <p className="text-sm text-muted-foreground">
                Negocie preços com Siderúrgica Nacional - potencial economia de R$ 50K baseado no histórico.
              </p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <h4 className="font-medium text-accent mb-2">Diversificação</h4>
              <p className="text-sm text-muted-foreground">
                Considere incluir 2 novos fornecedores para reduzir dependência e aumentar competitividade.
              </p>
            </div>
            <div className="p-4 bg-success/5 rounded-lg border border-success/20">
              <h4 className="font-medium text-success mb-2">Otimização</h4>
              <p className="text-sm text-muted-foreground">
                Automatize aprovações de compras até R$ 10K para reduzir tempo de processo em 40%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};