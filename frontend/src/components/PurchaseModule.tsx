import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { CreatePurchaseModal } from "@/components/modals/CreatePurchaseModal";
import { ShoppingCart, Plus, Clock, CheckCircle, Eye, Edit3 } from "lucide-react";
import { usePurchases, usePurchaseKPIs } from "@/hooks/usePurchases";

export const PurchaseModule = () => {
  const { data: purchasesData, isLoading: purchasesLoading } = usePurchases();
  const { data: kpisData, isLoading: kpisLoading } = usePurchaseKPIs();

  const purchases = purchasesData?.data || [];
  const totalValue = kpisData?.data?.totalPurchases || 0;
  const approvedCount = kpisData?.data?.approvedPurchases || 0;
  const pendingCount = kpisData?.data?.pendingQuotes || 0;

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
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
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
              value={kpisData?.data?.averageSavings?.toString() || "0"}
              format="percentage"
              trend="up"
              trendValue="+1.2% vs meta"
              icon={<ShoppingCart className="h-5 w-5 text-accent" />}
            />
          </>
        )}
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
          {purchasesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg animate-pulse">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded mb-1 w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-5 bg-muted rounded mb-1 w-20"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted rounded w-20"></div>
                      <div className="h-8 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{purchase.description || purchase.item_name}</h3>
                      <p className="text-sm text-muted-foreground">{purchase.supplier_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{purchase.contract_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        R$ {purchase.total_value.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">{purchase.order_number || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      purchase.status === 'approved' ? 'bg-success/10 text-success' :
                      purchase.status === 'pending' ? 'bg-warning/10 text-warning' :
                      purchase.status === 'delivered' ? 'bg-primary/10 text-primary' :
                      'bg-muted/10 text-muted-foreground'
                    }`}>
                      {purchase.status === 'approved' ? 'Aprovada' :
                       purchase.status === 'pending' ? 'Pendente' :
                       purchase.status === 'delivered' ? 'Entregue' :
                       purchase.status}
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
                    Data: {new Date(purchase.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
              {purchases.length === 0 && !purchasesLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma compra encontrada
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};