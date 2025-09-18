import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { CreateContractModal } from "@/components/modals/CreateContractModal";
import { ContractDetailsModal } from "@/components/modals/ContractDetailsModal";
import { Building2, Plus, Search, Filter } from "lucide-react";

export const ContractModule = () => {
  const contracts = [
    {
      id: 1,
      name: "Edifício Residencial - Zona Sul",
      client: "Construtora ABC",
      value: 2400000,
      spent: 1560000,
      progress: 65,
      status: "Em Andamento" as const,
      startDate: "2025-01-15",
      contractType: "material" as const,
      hasBudgetImport: true
    },
    {
      id: 2,
      name: "Complexo Comercial - Centro",
      client: "Incorporadora XYZ",
      value: 1800000,
      spent: 720000,
      progress: 40,
      status: "Em Andamento" as const,
      startDate: "2025-03-10",
      contractType: "service" as const,
      hasBudgetImport: false
    },
    {
      id: 3,
      name: "Infraestrutura Urbana - Norte",
      client: "Prefeitura Municipal",
      value: 950000,
      spent: 807500,
      progress: 85,
      status: "Finalizando" as const,
      startDate: "2024-11-01",
      contractType: "material" as const,
      hasBudgetImport: false
    }
  ];

  const totalValue = contracts.reduce((sum, contract) => sum + contract.value, 0);
  const totalSpent = contracts.reduce((sum, contract) => sum + contract.spent, 0);
  const avgProgress = contracts.reduce((sum, contract) => sum + contract.progress, 0) / contracts.length;

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
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{contract.name}</h3>
                    <p className="text-sm text-muted-foreground">{contract.client}</p>
                    <p className="text-xs text-muted-foreground mt-1">Início: {contract.startDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      R$ {contract.spent.toLocaleString('pt-BR')} / R$ {contract.value.toLocaleString('pt-BR')}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      contract.status === 'Em Andamento' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                    }`}>
                      {contract.status}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">{contract.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${contract.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <ContractDetailsModal contract={contract}>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </ContractDetailsModal>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};