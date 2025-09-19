import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { DollarSign, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { useAccounts, useAccountKPIs, useGenerateStatement, useExportAnalysis } from "@/hooks/useAccounts";

export const AccountModule = () => {
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const { data: kpisData, isLoading: kpisLoading } = useAccountKPIs();
  const generateStatement = useGenerateStatement();
  const exportAnalysis = useExportAnalysis();

  const accounts = accountsData?.data || [];
  const totalBalance = kpisData?.data?.totalBalance || 0;
  const totalSpent = kpisData?.data?.totalSpent || 0;
  const totalValue = kpisData?.data?.totalValue || 0;

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
          <Button
            variant="outline"
            onClick={() => generateStatement.mutate({ accountId: 1 })}
            disabled={generateStatement.isPending}
          >
            <DollarSign className="h-4 w-4" />
            {generateStatement.isPending ? 'Gerando...' : 'Exportar Extrato'}
          </Button>
          <Button
            variant="premium"
            onClick={() => exportAnalysis.mutate('pdf')}
            disabled={exportAnalysis.isPending}
          >
            <TrendingUp className="h-4 w-4" />
            {exportAnalysis.isPending ? 'Gerando...' : 'Análise Financeira'}
          </Button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpisLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-gradient-card border-0 shadow-card-hover">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
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
              value={totalValue > 0 ? ((totalSpent / totalValue) * 100).toFixed(1) : "0"}
              format="percentage"
              trend="up"
              icon={<TrendingDown className="h-5 w-5 text-accent" />}
            />
          </>
        )}
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
          {accountsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border-l-4 border-l-primary bg-muted/30 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="text-center p-3 bg-background rounded-lg">
                        <div className="h-3 bg-muted rounded mb-1"></div>
                        <div className="h-5 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-8"></div>
                    </div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-muted rounded w-24"></div>
                    <div className="h-8 bg-muted rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account, index) => {
                const executionPercentage = account.total_value > 0 ? (account.spent_amount / account.total_value) * 100 : 0;
                const isLowBalance = executionPercentage > 85;
                const balance = account.total_value - account.spent_amount;

                return (
                  <div key={account.id || index} className={`p-4 rounded-lg border-l-4 ${
                    isLowBalance ? 'border-l-warning bg-warning/5' : 'border-l-primary bg-muted/30'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {account.contract_name}
                          {isLowBalance && <AlertCircle className="h-4 w-4 text-warning" />}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Última atualização: {new Date(account.last_update).toLocaleDateString('pt-BR')}
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
                          R$ {account.total_value.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Realizado</p>
                        <p className="font-bold text-primary">
                          R$ {account.spent_amount.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Saldo</p>
                        <p className={`font-bold ${isLowBalance ? 'text-warning' : 'text-success'}`}>
                          R$ {balance.toLocaleString('pt-BR')}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Navigate to movements page or open modal
                          console.log('Ver movimentação do account:', account.id);
                        }}
                      >
                        Ver Movimentação
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generateStatement.mutate({ accountId: account.id })}
                        disabled={generateStatement.isPending}
                      >
                        {generateStatement.isPending ? 'Gerando...' : 'Gerar Extrato'}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {accounts.length === 0 && !accountsLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma conta encontrada
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};