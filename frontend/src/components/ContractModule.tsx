import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { CreateContractModal } from "@/components/modals/CreateContractModal";
import { ContractDetailsModal } from "@/components/modals/ContractDetailsModal";
import { ContractNFList } from "@/components/ContractNFList";
import { Building2, Plus, Search, Filter, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { useContracts, useContractKPIs, useContractRealizedValue } from "@/hooks/useContracts";
import { useState } from "react";

interface ContractRealizedValueProps {
  contractId: number;
}

const ContractRealizedValue = ({ contractId }: ContractRealizedValueProps) => {
  const { data: realizedData, isLoading, error } = useContractRealizedValue(contractId);

  if (isLoading) {
    return (
      <div className="text-sm">
        <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
        <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
      </div>
    );
  }

  if (error || !realizedData?.data) {
    return (
      <p className="text-sm text-muted-foreground">
        Valores não disponíveis
      </p>
    );
  }

  const data = realizedData.data;
  const isOverBudget = data.valor_realizado > data.valor_original;

  return (
    <div className="text-sm space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Realizado:</span>
        <span className="font-medium">
          R$ {data.valor_realizado.toLocaleString('pt-BR')}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Saldo:</span>
        <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
          R$ {data.saldo_restante.toLocaleString('pt-BR')}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">% Realizado:</span>
        <div className="flex items-center gap-1">
          {isOverBudget ? (
            <TrendingUp className="h-3 w-3 text-destructive" />
          ) : (
            <TrendingDown className="h-3 w-3 text-success" />
          )}
          <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
            {data.percentual_realizado.toFixed(1)}%
          </span>
        </div>
      </div>
      {data.total_nfs > 0 && (
        <div className="flex items-center justify-between pt-1 border-t">
          <span className="text-xs text-muted-foreground">NFs:</span>
          <span className="text-xs">
            {data.nfs_validadas}/{data.total_nfs} validadas
          </span>
        </div>
      )}
    </div>
  );
};

export const ContractModule = () => {
  const [selectedContractForNFs, setSelectedContractForNFs] = useState<number | null>(null);
  const { data: contractsData, isLoading: contractsLoading } = useContracts();
  const { data: kpisData, isLoading: kpisLoading } = useContractKPIs();

  // Safely extract contracts array
  const contracts = contractsData?.contracts || [];
  const totalValue = kpisData?.data?.totalValue || 0;
  const totalSpent = kpisData?.data?.totalSpent || 0;
  const avgProgress = kpisData?.data?.avgProgress || 0;

  // Se um contrato está selecionado para ver NFs, mostrar o componente de NFs
  if (selectedContractForNFs) {
    const contract = contracts.find(c => c.id === selectedContractForNFs);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => setSelectedContractForNFs(null)}
              className="mb-4"
            >
              ← Voltar para Contratos
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              Notas Fiscais - {contract?.name}
            </h1>
            <p className="text-muted-foreground">
              Visualização detalhada das notas fiscais e produtos/serviços
            </p>
          </div>
        </div>
        <ContractNFList contractId={selectedContractForNFs} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Contratos</h1>
          <p className="text-muted-foreground">
            Acompanhe o orçamento e realização de todos os contratos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
          <CreateContractModal />
        </div>
      </div>

      {/* KPIs */}
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
              title="Valor Total dos Contratos"
              value={totalValue}
              format="currency"
              icon={<Building2 className="h-5 w-5 text-primary" />}
            />
            <MetricCard
              title="Total Realizado"
              value={totalSpent}
              format="currency"
              trend="up"
              icon={<Building2 className="h-5 w-5 text-success" />}
            />
            <MetricCard
              title="Progresso Médio"
              value={avgProgress.toFixed(1)}
              format="percentage"
              trend="up"
              trendValue="+5% este mês"
              icon={<Building2 className="h-5 w-5 text-accent" />}
            />
          </>
        )}
      </div>

      {/* Contracts Table */}
      <Card className="bg-gradient-card border-0 shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Contratos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contractsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg animate-pulse">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded mb-1 w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-muted rounded mb-2 w-24"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-8"></div>
                    </div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <div className="h-8 bg-muted rounded w-20"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{contract.name}</h3>
                      <p className="text-sm text-muted-foreground">{contract.client || 'Cliente não informado'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Início: {new Date(contract.startDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right min-w-0 flex-shrink-0">
                      <div className="mb-2">
                        <p className="font-medium text-foreground">
                          Orçamento: R$ {contract.value.toLocaleString('pt-BR')}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          contract.status === 'Em Andamento' ? 'bg-primary/10 text-primary' :
                          contract.status === 'Concluído' ? 'bg-success/10 text-success' :
                          contract.status === 'Pausado' ? 'bg-warning/10 text-warning' :
                          'bg-muted/10 text-muted-foreground'
                        }`}>
                          {contract.status}
                        </span>
                      </div>
                      <ContractRealizedValue contractId={contract.id} />
                    </div>
                  </div>

                  <ContractProgressBar contractId={contract.id} />

                  <div className="flex gap-2 mt-3">
                    <ContractDetailsModal contract={contract}>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </ContractDetailsModal>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedContractForNFs(contract.id)}
                    >
                      <Receipt className="h-4 w-4 mr-1" />
                      Ver NFs
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log('Editar contrato:', contract.id);
                        // TODO: Implement contract edit modal
                      }}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
              {contracts.length === 0 && !contractsLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum contrato encontrado
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface ContractProgressBarProps {
  contractId: number;
}

const ContractProgressBar = ({ contractId }: ContractProgressBarProps) => {
  const { data: realizedData, isLoading } = useContractRealizedValue(contractId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="w-full bg-muted rounded-full h-2 animate-pulse"></div>
      </div>
    );
  }

  const progress = realizedData?.data?.percentual_realizado || 0;
  const isOverBudget = progress > 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progresso Financeiro</span>
        <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
          {progress.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isOverBudget ? 'bg-destructive' : 'bg-gradient-primary'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
        {isOverBudget && (
          <div
            className="h-2 rounded-full bg-destructive/50 -mt-2 transition-all duration-300"
            style={{ width: `${Math.min(progress - 100, 100)}%`, marginLeft: '100%' }}
          />
        )}
      </div>
      {realizedData?.data && (
        <div className="text-xs text-muted-foreground">
          Base: {realizedData.data.nfs_validadas} de {realizedData.data.total_nfs} NFs validadas
        </div>
      )}
    </div>
  );
};

