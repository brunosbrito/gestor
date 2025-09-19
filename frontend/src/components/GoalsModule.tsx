import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { Target, TrendingUp, Award, Settings } from "lucide-react";
import { useGoals, useGoalKPIs, useGenerateSavingsReport, useConfigureGoals } from "@/hooks/useGoals";

export const GoalsModule = () => {
  const { data: goalsData, isLoading: goalsLoading } = useGoals();
  const { data: kpisData, isLoading: kpisLoading } = useGoalKPIs();
  const generateReport = useGenerateSavingsReport();
  const configureGoals = useConfigureGoals();

  const goals = goalsData?.data || [];
  const totalSaved = kpisData?.data?.totalSaved || 0;
  const avgAchievement = kpisData?.data?.avgAchievement || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Metas e Economia</h1>
          <p className="text-muted-foreground">
            Acompanhe o cumprimento das metas de redução de custos
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Open configure goals modal
              console.log('Configurar metas');
            }}
          >
            <Settings className="h-4 w-4" />
            Configurar Metas
          </Button>
          <Button
            variant="premium"
            onClick={() => generateReport.mutate()}
            disabled={generateReport.isPending}
          >
            <Award className="h-4 w-4" />
            {generateReport.isPending ? 'Gerando...' : 'Relatório de Economia'}
          </Button>
        </div>
      </div>

      {/* Goals KPIs */}
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
              title="Economia Total Realizada"
              value={totalSaved}
              format="currency"
              trend="up"
              trendValue="R$ 85K este mês"
              icon={<TrendingUp className="h-5 w-5 text-success" />}
            />
            <MetricCard
              title="Atingimento Médio"
              value={avgAchievement.toFixed(1)}
              format="percentage"
              trend="up"
              trendValue="+5% vs último mês"
              icon={<Target className="h-5 w-5 text-primary" />}
            />
            <MetricCard
              title="Contratos com Meta Batida"
              value={goals.filter(g => g.status === 'achieved' || g.status === 'exceeded').length}
              trend="up"
              icon={<Award className="h-5 w-5 text-accent" />}
            />
          </>
        )}
      </div>

      {/* Goals Progress */}
      <Card className="bg-gradient-card border-0 shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progresso das Metas por Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goalsLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="text-center p-3 bg-background rounded-lg">
                        <div className="h-3 bg-muted rounded mb-1"></div>
                        <div className="h-5 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map((goal, index) => {
                const achievement = goal.target_reduction > 0 ? (goal.current_reduction / goal.target_reduction) * 100 : 0;
                const getStatusColor = () => {
                  switch (goal.status) {
                    case 'achieved': return 'success';
                    case 'exceeded': return 'primary';
                    case 'progress': return 'warning';
                    default: return 'muted';
                  }
                };

                const getStatusText = () => {
                  switch (goal.status) {
                    case 'achieved': return 'Meta Atingida';
                    case 'exceeded': return 'Meta Superada';
                    case 'progress': return 'Em Progresso';
                    default: return 'Não Iniciado';
                  }
                };

                return (
                  <div key={goal.id || index} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{goal.contract_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Meta: {goal.target_reduction}% de redução
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                          ${goal.status === 'achieved' ? 'bg-success/10 text-success' :
                            goal.status === 'exceeded' ? 'bg-primary/10 text-primary' :
                            goal.status === 'progress' ? 'bg-warning/10 text-warning' :
                            'bg-muted/10 text-muted-foreground'}`}>
                          {getStatusText()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Meta</p>
                        <p className="font-bold text-foreground">{goal.target_reduction}%</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Atual</p>
                        <p className="font-bold text-primary">{goal.current_reduction}%</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Economia</p>
                        <p className="font-bold text-success">
                          R$ {goal.total_saved.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso da Meta</span>
                        <span className="font-medium">{achievement.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            goal.status === 'exceeded' ? 'bg-gradient-to-r from-success to-primary' :
                            goal.status === 'achieved' ? 'bg-gradient-to-r from-success to-success' :
                            'bg-gradient-primary'
                          }`}
                          style={{ width: `${Math.min(achievement, 100)}%` }}
                        />
                      </div>
                      {achievement > 100 && (
                        <p className="text-xs text-success font-medium">
                          🎉 Meta superada em {(achievement - 100).toFixed(1)}%
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Open adjust goal modal
                          console.log('Ajustar meta:', goal.id);
                        }}
                      >
                        Ajustar Meta
                      </Button>
                    </div>
                  </div>
                );
              })}
              {goals.length === 0 && !goalsLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma meta encontrada
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};