import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { Target, TrendingUp, Award, Settings } from "lucide-react";

export const GoalsModule = () => {
  const goals = [
    {
      contract: "Edifício Residencial - Zona Sul",
      targetReduction: 10,
      currentReduction: 12.5,
      saved: 300000,
      status: "achieved"
    },
    {
      contract: "Complexo Comercial - Centro",
      targetReduction: 8,
      currentReduction: 6.2,
      saved: 111600,
      status: "progress"
    },
    {
      contract: "Infraestrutura Urbana - Norte",
      targetReduction: 12,
      currentReduction: 15.8,
      saved: 150100,
      status: "exceeded"
    }
  ];

  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const avgAchievement = goals.reduce((sum, goal) => 
    sum + (goal.currentReduction / goal.targetReduction * 100), 0) / goals.length;

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
          <Button variant="outline">
            <Settings className="h-4 w-4" />
            Configurar Metas
          </Button>
          <Button variant="premium">
            <Award className="h-4 w-4" />
            Relatório de Economia
          </Button>
        </div>
      </div>

      {/* Goals KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="space-y-6">
            {goals.map((goal, index) => {
              const achievement = (goal.currentReduction / goal.targetReduction) * 100;
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
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{goal.contract}</h3>
                      <p className="text-sm text-muted-foreground">
                        Meta: {goal.targetReduction}% de redução
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium 
                        bg-${getStatusColor()}/10 text-${getStatusColor()}`}>
                        {getStatusText()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Meta</p>
                      <p className="font-bold text-foreground">{goal.targetReduction}%</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Atual</p>
                      <p className="font-bold text-primary">{goal.currentReduction}%</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Economia</p>
                      <p className="font-bold text-success">
                        R$ {goal.saved.toLocaleString('pt-BR')}
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
                    <Button variant="ghost" size="sm">
                      Ajustar Meta
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