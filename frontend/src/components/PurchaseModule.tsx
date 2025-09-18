import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { CreatePurchaseModal } from "@/components/modals/CreatePurchaseModal";
import { ShoppingCart, Plus, Clock, CheckCircle, Eye, Edit3 } from "lucide-react";

export const PurchaseModule = () => {
  const purchases = [
    {
      id: 1,
      item: "Vergalhões 12mm - 10 toneladas",
      supplier: "Siderúrgica Nacional",
      contract: "Edifício Residencial - Zona Sul",
      orderNumber: "OC-2025-001",
      value: 85000,
      status: "Aprovada",
      date: "2025-09-10"
    },
    {
      id: 2,
      item: "Cimento CP-II 50kg - 200 sacos",
      supplier: "Cimentos do Brasil",
      contract: "Complexo Comercial - Centro",
      orderNumber: "OC-2025-002",
      value: 32000,
      status: "Cotação",
      date: "2025-09-11"
    },
    {
      id: 3,
      item: "Madeira para Forma - 50m³",
      supplier: "Madeireira São Paulo",
      contract: "Infraestrutura Urbana - Norte",
      orderNumber: "OC-2025-003",
      value: 67500,
      status: "Entregue",
      date: "2025-09-08"
    }
  ];

  const totalValue = purchases.reduce((sum, purchase) => sum + purchase.value, 0);
  const approvedCount = purchases.filter(p => p.status === "Aprovada").length;
  const pendingCount = purchases.filter(p => p.status === "Cotação").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Compras</h1>
          <p className="text-muted-foreground">
            Controle de ordens de compra, cotações e fornecedores
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => {
              console.log('Ver cotações pendentes');
              // TODO: Implement quotations filter/view
            }}
          >
            <Clock className="h-4 w-4" />
            Cotações Pendentes
          </Button>
          <CreatePurchaseModal />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total em Compras"
          value={totalValue}
          format="currency"
          icon={<ShoppingCart className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Compras Aprovadas"
          value={approvedCount}
          trend="up"
          icon={<CheckCircle className="h-5 w-5 text-success" />}
        />
        <MetricCard
          title="Cotações Pendentes"
          value={pendingCount}
          trend="neutral"
          icon={<Clock className="h-5 w-5 text-warning" />}
        />
        <MetricCard
          title="Economia Média"
          value="8.5"
          format="percentage"
          trend="up"
          trendValue="+1.2% vs meta"
          icon={<ShoppingCart className="h-5 w-5 text-accent" />}
        />
      </div>

      {/* Purchases Table */}
      <Card className="bg-gradient-card border-0 shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Ordens de Compra Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{purchase.item}</h3>
                    <p className="text-sm text-muted-foreground">{purchase.supplier}</p>
                    <p className="text-xs text-muted-foreground mt-1">{purchase.contract}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      R$ {purchase.value.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">{purchase.orderNumber}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    purchase.status === 'Aprovada' ? 'bg-success/10 text-success' :
                    purchase.status === 'Cotação' ? 'bg-warning/10 text-warning' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {purchase.status}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        console.log('Ver cotações da compra:', purchase.id);
                        // TODO: Implement quotations modal
                      }}
                    >
                      <Eye className="h-3 w-3" />
                      Ver Cotações
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        console.log('Editar compra:', purchase.id);
                        // TODO: Implement purchase edit modal
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                      Editar
                    </Button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  Data: {purchase.date}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};