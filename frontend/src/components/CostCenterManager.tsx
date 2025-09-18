import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  useCostCenters, 
  useCreateCostCenter, 
  useUpdateCostCenter, 
  useDeleteCostCenter,
  useClassificationRules,
  useCreateClassificationRule,
  useUpdateClassificationRule,
  useDeleteClassificationRule,
  useClassificationStats,
  useTrainClassifier
} from "@/hooks/useClassification";
import { CostCenter, ClassificationRule } from "@/services/classificationService";
import { MetricCard } from "@/components/MetricCard";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Target,
  Settings,
  BarChart3,
  Brain,
  Tag,
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from "lucide-react";

export const CostCenterManager = () => {
  const [costCenterModalOpen, setCostCenterModalOpen] = useState(false);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const [editingRule, setEditingRule] = useState<ClassificationRule | null>(null);
  
  const { data: costCenters, isLoading: costCentersLoading } = useCostCenters();
  const { data: rules, isLoading: rulesLoading } = useClassificationRules();
  const { data: stats, isLoading: statsLoading } = useClassificationStats();
  
  const createCostCenter = useCreateCostCenter();
  const updateCostCenter = useUpdateCostCenter();
  const deleteCostCenter = useDeleteCostCenter();
  
  const createRule = useCreateClassificationRule();
  const updateRule = useUpdateClassificationRule();
  const deleteRule = useDeleteClassificationRule();
  
  const trainClassifier = useTrainClassifier();

  const getCategoryColor = (category: string) => {
    const colors = {
      material: 'bg-blue-500',
      labor: 'bg-green-500',
      equipment: 'bg-orange-500',
      service: 'bg-purple-500',
      overhead: 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-400';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      material: 'Material',
      labor: 'Mão de Obra',
      equipment: 'Equipamento',
      service: 'Serviço',
      overhead: 'Overhead'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const handleCreateCostCenter = (data: Omit<CostCenter, 'id'>) => {
    createCostCenter.mutate(data, {
      onSuccess: () => setCostCenterModalOpen(false)
    });
  };

  const handleEditCostCenter = (costCenter: CostCenter) => {
    setEditingCostCenter(costCenter);
    setCostCenterModalOpen(true);
  };

  const handleUpdateCostCenter = (data: Partial<CostCenter>) => {
    if (editingCostCenter) {
      updateCostCenter.mutate({ id: editingCostCenter.id, costCenter: data }, {
        onSuccess: () => {
          setCostCenterModalOpen(false);
          setEditingCostCenter(null);
        }
      });
    }
  };

  const handleDeleteCostCenter = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este centro de custo?')) {
      deleteCostCenter.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Centros de Custo</h1>
          <p className="text-muted-foreground">
            Configure centros de custo e regras de classificação automática
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => trainClassifier.mutate([])}
            disabled={trainClassifier.isPending}
          >
            <Brain className="h-4 w-4" />
            {trainClassifier.isPending ? 'Treinando...' : 'Treinar IA'}
          </Button>
          <Button 
            onClick={() => {
              setEditingCostCenter(null);
              setCostCenterModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Novo Centro de Custo
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Itens Classificados"
            value={stats.data.classified}
            format="number"
            trend="up"
            trendValue={`de ${stats.data.totalItems} total`}
            icon={<CheckCircle className="h-5 w-5 text-success" />}
          />
          <MetricCard
            title="Precisão do Sistema"
            value={stats.data.accuracyScore ? (stats.data.accuracyScore * 100).toFixed(1) : '0'}
            format="percentage"
            trend="up"
            icon={<Target className="h-5 w-5 text-primary" />}
          />
          <MetricCard
            title="Aguardando Revisão"
            value={stats.data.needsReview}
            format="number"
            trend="neutral"
            icon={<AlertCircle className="h-5 w-5 text-warning" />}
          />
          <MetricCard
            title="Centros Ativos"
            value={costCenters?.data.filter(c => c.active).length || 0}
            format="number"
            icon={<Tag className="h-5 w-5 text-accent" />}
          />
        </div>
      )}

      <Tabs defaultValue="cost-centers">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cost-centers">Centros de Custo</TabsTrigger>
          <TabsTrigger value="rules">Regras de Classificação</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Cost Centers Tab */}
        <TabsContent value="cost-centers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Centros de Custo Configurados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {costCentersLoading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {costCenters?.data.map((center) => (
                    <div key={center.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getCategoryColor(center.category)}`} />
                            <h3 className="font-semibold">{center.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {center.description}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            {getCategoryLabel(center.category)}
                          </Badge>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCostCenter(center)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCostCenter(center.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {center.keywords.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Palavras-chave:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {center.keywords.slice(0, 3).map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                            {center.keywords.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{center.keywords.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant={center.active ? "default" : "secondary"}>
                          {center.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {(!costCenters?.data || costCenters.data.length === 0) && (
                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                      Nenhum centro de custo configurado
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classification Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Regras de Classificação
              </CardTitle>
              <Button 
                onClick={() => {
                  setEditingRule(null);
                  setRuleModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </CardHeader>
            <CardContent>
              {rulesLoading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <div className="space-y-4">
                  {rules?.data.map((rule) => (
                    <div key={rule.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{rule.name}</h3>
                            <Badge 
                              variant={rule.active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {rule.active ? "Ativa" : "Inativa"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Prioridade {rule.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rule.conditions.length} condição(ões) configurada(s)
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingRule(rule);
                              setRuleModalOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir esta regra?')) {
                                deleteRule.mutate(rule.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {rule.conditions.slice(0, 2).map((condition, idx) => (
                          <div key={idx} className="text-xs bg-muted/50 p-2 rounded">
                            <span className="font-medium">{condition.field}</span>
                            {' '}<span className="text-muted-foreground">{condition.operator}</span>
                            {' '}<span className="font-mono">"{condition.value}"</span>
                          </div>
                        ))}
                        {rule.conditions.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            ... e mais {rule.conditions.length - 2} condição(ões)
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!rules?.data || rules.data.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma regra de classificação configurada
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Centros de Custo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.data.topCostCenters ? (
                  <div className="space-y-3">
                    {stats.data.topCostCenters.slice(0, 5).map((center, idx) => (
                      <div key={center.costCenterId} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{center.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {center.itemCount} itens
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            R$ {center.totalValue.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Dados não disponíveis
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.data.recentActivity ? (
                  <div className="space-y-3">
                    {stats.data.recentActivity.slice(0, 5).map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {activity.itemsClassified} itens classificados
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        {activity.accuracyScore && (
                          <Badge variant="secondary">
                            {(activity.accuracyScore * 100).toFixed(0)}% precisão
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma atividade recente
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cost Center Modal */}
      <CostCenterModal
        open={costCenterModalOpen}
        onOpenChange={setCostCenterModalOpen}
        costCenter={editingCostCenter}
        onSave={editingCostCenter ? handleUpdateCostCenter : handleCreateCostCenter}
        isLoading={createCostCenter.isPending || updateCostCenter.isPending}
      />
    </div>
  );
};

// Cost Center Modal Component
interface CostCenterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  costCenter: CostCenter | null;
  onSave: (data: any) => void;
  isLoading: boolean;
}

const CostCenterModal = ({ open, onOpenChange, costCenter, onSave, isLoading }: CostCenterModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'material' as CostCenter['category'],
    keywords: [] as string[],
    color: '#3b82f6',
    active: true
  });

  React.useEffect(() => {
    if (costCenter) {
      setFormData({
        name: costCenter.name,
        description: costCenter.description,
        category: costCenter.category,
        keywords: costCenter.keywords,
        color: costCenter.color || '#3b82f6',
        active: costCenter.active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'material',
        keywords: [],
        color: '#3b82f6',
        active: true
      });
    }
  }, [costCenter, open]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {costCenter ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
          </DialogTitle>
          <DialogDescription>
            Configure as informações do centro de custo para classificação automática
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Estrutura, Alvenaria, Instalações..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o que engloba este centro de custo"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value: CostCenter['category']) => 
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="labor">Mão de Obra</SelectItem>
                <SelectItem value="equipment">Equipamento</SelectItem>
                <SelectItem value="service">Serviço</SelectItem>
                <SelectItem value="overhead">Overhead</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Centro de custo ativo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name || isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};