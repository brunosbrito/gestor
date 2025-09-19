import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Filter } from "lucide-react";
import { useReports, useGenerateAnalyticalReport, useGenerateAccountReport, useExportDashboard, useDownloadReport } from "@/hooks/useReports";

export const ReportsModule = () => {
  const { data: reportsData, isLoading: reportsLoading } = useReports();
  const generateAnalytical = useGenerateAnalyticalReport();
  const generateAccount = useGenerateAccountReport();
  const exportDashboard = useExportDashboard();
  const downloadReport = useDownloadReport();

  const reports = reportsData?.data || [];

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
            <Button
              className="w-full"
              variant="outline"
              onClick={() => generateAnalytical.mutate()}
              disabled={generateAnalytical.isPending}
            >
              {generateAnalytical.isPending ? 'Gerando...' : 'Gerar Analítico'}
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
            <Button
              className="w-full"
              variant="outline"
              onClick={() => generateAccount.mutate()}
              disabled={generateAccount.isPending}
            >
              {generateAccount.isPending ? 'Gerando...' : 'Gerar Sintético'}
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
            <Button
              className="w-full"
              variant="outline"
              onClick={() => exportDashboard.mutate('pdf')}
              disabled={exportDashboard.isPending}
            >
              {exportDashboard.isPending ? 'Exportando...' : 'Exportar Dashboard'}
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
          {reportsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-muted/30 rounded-lg animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded mb-2 w-2/3"></div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="h-3 bg-muted rounded w-16"></div>
                        <div className="h-3 bg-muted rounded w-20"></div>
                        <div className="h-3 bg-muted rounded w-12"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-6 bg-muted rounded w-16"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded w-20"></div>
                        <div className="h-8 bg-muted rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.contract_name || 'Todos os Contratos'}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Tipo: {report.type}</span>
                        <span>Data: {new Date(report.created_at).toLocaleDateString('pt-BR')}</span>
                        <span>Tamanho: {report.file_size || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        report.status === 'completed' || report.status === 'available'
                          ? 'bg-success/10 text-success'
                          : report.status === 'processing'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted/10 text-muted-foreground'
                      }`}>
                        {report.status === 'completed' ? 'Finalizado' :
                         report.status === 'available' ? 'Disponível' :
                         report.status === 'processing' ? 'Em Geração' :
                         'Pendente'}
                      </span>

                      {(report.status === 'completed' || report.status === 'available') && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (report.file_url) {
                                window.open(report.file_url, '_blank');
                              }
                            }}
                          >
                            <Eye className="h-3 w-3" />
                            Visualizar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadReport.mutate(report.id)}
                            disabled={downloadReport.isPending}
                          >
                            <Download className="h-3 w-3" />
                            {downloadReport.isPending ? 'Baixando...' : 'Download'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {reports.length === 0 && !reportsLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum relatório encontrado
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};