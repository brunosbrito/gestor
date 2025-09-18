import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { DollarSign, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

export const AccountModule = () => {
  const accounts = [
    {
      contract: "Edifício Residencial - Zona Sul",
      totalValue: 2400000,
      spent: 1560000,
      balance: 840000,
      lastUpdate: "2025-09-12",
      status: "normal"
    },
    {
      contract: "Complexo Comercial - Centro",
      totalValue: 1800000,
      spent: 720000,
      balance: 1080000,
      lastUpdate: "2025-09-11",
      status: "normal"
    },
    {
      contract: "Infraestrutura Urbana - Norte",
      totalValue: 950000,
      spent: 807500,
      balance: 142500,
      lastUpdate: "2025-09-10",
      status: "alert"
    }
  ];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalSpent = accounts.reduce((sum, acc) => sum + acc.spent, 0);
  const totalValue = accounts.reduce((sum, acc) => sum + acc.totalValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Conta Corrente</h1>
          <p className="text-muted-foreground">
            Saldo em tempo real de todos os contratos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <DollarSign className="h-4 w-4" />
            Exportar Extrato
          </Button>
          <Button variant="premium">
            <TrendingUp className="h-4 w-4" />
            Análise Financeira
          </Button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Saldo Total Disponível"
          value={totalBalance}
          format="currency"
          trend="up"
          icon={<DollarSign className="h-5 w-5 text-success" />}
        />
        <MetricCard
          title="Total Realizado"
          value={totalSpent}
          format="currency"
          trend="up"
          trendValue="R$ 85K esta semana"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="% de Realização"
          value={((totalSpent / totalValue) * 100).toFixed(1)}
          format="percentage"
          trend="up"
          icon={<TrendingDown className="h-5 w-5 text-accent" />}
        />
      </div>

      {/* Account Details */}
      <Card className="bg-gradient-card border-0 shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Detalhamento por Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account, index) => {
              const executionPercentage = (account.spent / account.totalValue) * 100;
              const isLowBalance = executionPercentage > 85;
              
              return (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  isLowBalance ? 'border-l-warning bg-warning/5' : 'border-l-primary bg-muted/30'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {account.contract}
                        {isLowBalance && <AlertCircle className="h-4 w-4 text-warning" />}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Última atualização: {account.lastUpdate}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isLowBalance ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>
                      {isLowBalance ? 'Atenção' : 'Normal'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Valor do Contrato</p>
                      <p className="font-bold text-foreground">
                        R$ {account.totalValue.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Realizado</p>
                      <p className="font-bold text-primary">
                        R$ {account.spent.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Saldo</p>
                      <p className={`font-bold ${isLowBalance ? 'text-warning' : 'text-success'}`}>
                        R$ {account.balance.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Realização</span>
                      <span className="font-medium">{executionPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          isLowBalance ? 'bg-gradient-to-r from-warning to-destructive' : 'bg-gradient-primary'
                        }`}
                        style={{ width: `${Math.min(executionPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      Ver Movimentação
                    </Button>
                    <Button variant="ghost" size="sm">
                      Gerar Extrato
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};