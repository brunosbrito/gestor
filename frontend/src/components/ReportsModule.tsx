import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Filter } from "lucide-react";

export const ReportsModule = () => {
  const reports = [
    {
      id: 1,
      name: "Relatório Analítico - Agosto 2025",
      type: "Analítico",
      contract: "Edifício Residencial - Zona Sul",
      date: "2025-08-31",
      status: "Finalizado",
      size: "2.4 MB"
    },
    {
      id: 2,
      name: "Conta Corrente - Complexo Comercial",
      type: "Sintético",
      contract: "Complexo Comercial - Centro", 
      date: "2025-09-10",
      status: "Disponível",
      size: "1.1 MB"
    },
    {
      id: 3,
      name: "Dashboard Gerencial - Setembro",
      type: "Dashboard",
      contract: "Todos os Contratos",
      date: "2025-09-12",
      status: "Em Geração",
      size: "---"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere e acesse relatórios analíticos e sintéticos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="premium">
            <FileText className="h-4 w-4" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-0 shadow-card-hover cursor-pointer hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Relatório Analítico</h3>
                <p className="text-xs text-muted-foreground">Detalhado para uso interno</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Inclui todos os detalhes de itens, fornecedores, centros de custo, valores e datas.
            </p>
            <Button className="w-full" variant="outline">
              Gerar Analítico
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-hover cursor-pointer hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Conta Corrente</h3>
                <p className="text-xs text-muted-foreground">Sintético para cliente</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Relatório resumido com informações essenciais para o cliente.
            </p>
            <Button className="w-full" variant="outline">
              Gerar Sintético
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-hover cursor-pointer hover:shadow-glow transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-success/10 rounded-lg">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Dashboard Export</h3>
                <p className="text-xs text-muted-foreground">KPIs e gráficos</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Exporta dashboards gerenciais em PDF com todos os indicadores.
            </p>
            <Button className="w-full" variant="outline">
              Exportar Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className="bg-gradient-card border-0 shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">{report.contract}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Tipo: {report.type}</span>
                      <span>Data: {report.date}</span>
                      <span>Tamanho: {report.size}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      report.status === 'Finalizado' || report.status === 'Disponível' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {report.status}
                    </span>
                    
                    {(report.status === 'Finalizado' || report.status === 'Disponível') && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                          Visualizar
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};