import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Calendar, DollarSign, TrendingUp, Eye, Edit, FileSpreadsheet, Package, Wrench } from "lucide-react";
import { ContractType, BudgetItem } from "@/types";
import { ExecutionDashboard } from "@/components/ExecutionDashboard";

// Interface definitions
interface Contract {
  id: number;
  name: string;
  client: string;
  value: number;
  spent: number;
  progress: number;
  status: 'Em Andamento' | 'Finalizando' | 'Concluído' | 'Pausado';
  startDate: string;
  contractType?: ContractType;
  predictedBudget?: BudgetItem[];
  hasBudgetImport?: boolean;
}

interface ContractDetailsModalProps {
  contract: Contract;
  children: React.ReactNode;
}

export const ContractDetailsModal = ({ contract, children }: ContractDetailsModalProps) => {
  const remaining = contract.value - contract.spent;
  const progressPercent = (contract.progress / 100) * 100;
  
  const getContractTypeLabel = (type: ContractType) => {
    return type === 'material' ? 'Material/Produto' : 'Serviço';
  };

  const getContractTypeIcon = (type: ContractType) => {
    return type === 'material' ? Package : Wrench;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {contract.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span>Cliente: {contract.client} • Início: {contract.startDate}</span>
            {contract.contractType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {React.createElement(getContractTypeIcon(contract.contractType), { className: "h-3 w-3" })}
                {getContractTypeLabel(contract.contractType)}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="budget" disabled={!contract.hasBudgetImport}>
              Orçamento Previsto
            </TabsTrigger>
            <TabsTrigger value="execution" disabled={!contract.hasBudgetImport}>
              Realização
            </TabsTrigger>
            <TabsTrigger value="progress">Acompanhamento</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge variant={contract.status === 'Em Andamento' ? 'default' : 'secondary'}>
                {contract.status}
              </Badge>
              {contract.hasBudgetImport && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-3 w-3" />
                  Orçamento Importado
                </Badge>
              )}
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {contract.value.toLocaleString('pt-BR')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Realizado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    R$ {contract.spent.toLocaleString('pt-BR')}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    R$ {remaining.toLocaleString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Physical Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Progresso Físico</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{contract.progress}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                  </CardContent>
                </Card>

                {/* Financial Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Progresso Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {((contract.spent / contract.value) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(contract.spent / contract.value) * 100} className="h-3" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            {contract.predictedBudget && contract.predictedBudget.length > 0 ? (
              <div className="space-y-6">
                {/* Budget Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      Resumo do Orçamento Previsto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Itens</p>
                        <p className="text-2xl font-bold">{contract.predictedBudget.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Previsto</p>
                        <p className="text-2xl font-bold">
                          R$ {contract.predictedBudget.reduce((sum, item) => sum + item.totalValue, 0).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Categorias</p>
                        <p className="text-2xl font-bold">
                          {new Set(contract.predictedBudget.map(item => item.category)).size}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Itens do Orçamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {contract.predictedBudget.map((item) => (
                        <div key={item.id} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.description}</h4>
                              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                <span>Categoria: {item.category}</span>
                                {item.costCenter && <span>Centro de Custo: {item.costCenter}</span>}
                              </div>
                              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                {item.quantity && item.unit && (
                                  <span>{item.quantity} {item.unit}</span>
                                )}
                                {item.hours && (
                                  <span>{item.hours}h</span>
                                )}
                                {item.serviceType && (
                                  <span>Tipo: {item.serviceType}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">
                                R$ {item.totalValue.toLocaleString('pt-BR')}
                              </p>
                              {item.unitValue && (
                                <p className="text-xs text-muted-foreground">
                                  R$ {item.unitValue.toLocaleString('pt-BR')} / {item.unit || 'unid'}
                                </p>
                              )}
                              {item.hourlyRate && (
                                <p className="text-xs text-muted-foreground">
                                  R$ {item.hourlyRate.toLocaleString('pt-BR')} / hora
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum orçamento previsto foi importado para este contrato
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="execution" className="space-y-6">
            <ExecutionDashboard contractId={contract.id} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Detailed progress tracking will be implemented here */}
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Acompanhamento detalhado em desenvolvimento
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Buttons */}
          <Separator />
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                console.log('Editar contrato:', contract.id);
                // TODO: Implement contract edit functionality
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Contrato
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                console.log('Ver compras do contrato:', contract.id);
                // TODO: Navigate to purchases filtered by contract
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Compras
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};