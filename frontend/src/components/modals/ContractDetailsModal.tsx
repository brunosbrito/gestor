import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  FileSpreadsheet,
  Package,
  Wrench,
  Loader2,
  Download,
  Receipt,
} from "lucide-react";
import {
  ContractType,
  BudgetItem,
  Contract,
  ContractDetails,
  ValorPrevisto,
} from "@/types";
import { InvoiceUpload } from "@/components/InvoiceUpload";
import { ImportNFTab } from "@/components/ImportNFTab";
import { ContractNFList } from "@/components/ContractNFList";
import { useContract } from "@/hooks/useContracts";

// Interface definitions

interface ContractDetailsModalProps {
  contract: Contract;
  children: React.ReactNode;
}

export const ContractDetailsModal = ({
  contract,
  children,
}: ContractDetailsModalProps) => {
  // Buscar detalhes completos do contrato
  const { data: contractDetails, isLoading, error } = useContract(contract.id);

  // Use contract details if available, fallback to basic contract data
  const fullContract: ContractDetails = contractDetails ?? contract;

  // Verificações de segurança para valores do contrato
  const contractValue =
    typeof fullContract.value === "number" ? fullContract.value : 0;
  const contractSpent =
    typeof fullContract.spent === "number" ? fullContract.spent : 0;
  const contractProgress =
    typeof fullContract.progress === "number"
      ? Math.min(Math.max(fullContract.progress, 0), 100)
      : 0;

  const remaining = contractValue - contractSpent;
  const progressPercent = contractProgress;
  const financialProgress =
    contractValue > 0 ? (contractSpent / contractValue) * 100 : 0;

  const getContractTypeLabel = (type: ContractType) => {
    return type === "material" ? "Material/Produto" : "Serviço";
  };

  const getContractTypeIcon = (type: ContractType) => {
    return type === "material" ? Package : Wrench;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {fullContract.name}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span>
              Cliente: {fullContract.client} • Início: {fullContract.startDate}
            </span>
            {fullContract.contractType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {React.createElement(
                  getContractTypeIcon(fullContract.contractType),
                  { className: "h-3 w-3" }
                )}
                {getContractTypeLabel(fullContract.contractType)}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="budget">Orçamento Previsto</TabsTrigger>
            <TabsTrigger value="import-nf">Importar NFs</TabsTrigger>
            <TabsTrigger value="realizacao">Notas Fiscais</TabsTrigger>
            <TabsTrigger value="progress">Acompanhamento</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  fullContract.status === "Em Andamento"
                    ? "default"
                    : "secondary"
                }
              >
                {fullContract.status}
              </Badge>
              {fullContract.valores_previstos &&
                fullContract.valores_previstos.length > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileSpreadsheet className="h-3 w-3" />
                    Orçamento Importado ({
                      fullContract.valores_previstos.length
                    }{" "}
                    itens)
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
                    R$ {contractValue.toLocaleString("pt-BR")}
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
                    R$ {contractSpent.toLocaleString("pt-BR")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    R$ {remaining.toLocaleString("pt-BR")}
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
                    <CardTitle className="text-base">
                      Progresso Físico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {contractProgress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                  </CardContent>
                </Card>

                {/* Financial Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Progresso Financeiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {financialProgress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={financialProgress} className="h-3" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            {fullContract.valores_previstos &&
            fullContract.valores_previstos.length > 0 ? (
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
                        <p className="text-sm text-muted-foreground">
                          Total de Itens
                        </p>
                        <p className="text-2xl font-bold">
                          {fullContract.valores_previstos.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Valor Previsto
                        </p>
                        <p className="text-2xl font-bold">
                          R${" "}
                          {fullContract.valores_previstos
                            .reduce(
                              (sum, item) =>
                                sum +
                                (typeof item.preco_total === "number"
                                  ? item.preco_total
                                  : 0),
                              0
                            )
                            .toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Itens Únicos
                        </p>
                        <p className="text-2xl font-bold">
                          {
                            new Set(
                              fullContract.valores_previstos.map(
                                (item) => item.item
                              )
                            ).size
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Itens do Orçamento QQP_Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead className="w-[80px]">Item</TableHead>
                            <TableHead className="min-w-[200px]">Serviços</TableHead>
                            <TableHead className="w-[80px]">Unidade</TableHead>
                            <TableHead className="w-[100px]">Qtd Mensal</TableHead>
                            <TableHead className="w-[100px]">Duração (meses)</TableHead>
                            <TableHead className="w-[120px] text-right">Preço Total</TableHead>
                            <TableHead className="w-[100px] text-right">Qtd Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fullContract.valores_previstos.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/50">
                              <TableCell className="font-mono text-xs">
                                {item.item}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{item.servicos}</p>
                                  {item.observacao && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      <span className="font-medium">Obs:</span> {item.observacao}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {item.unidade || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.qtd_mensal || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.duracao_meses || "-"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                R$ {(typeof item.preco_total === "number"
                                  ? item.preco_total
                                  : 0
                                ).toLocaleString("pt-BR")}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {item.qtd_mensal && item.duracao_meses ? (
                                  <>
                                    {(item.qtd_mensal * item.duracao_meses).toFixed(2)}{" "}
                                    {item.unidade || ""}
                                  </>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
            <InvoiceUpload contractId={fullContract.id} />
          </TabsContent>

          <TabsContent value="import-nf" className="space-y-6">
            <ImportNFTab
              contractId={fullContract.id}
              contractName={fullContract.name}
            />
          </TabsContent>

          <TabsContent value="realizacao" className="space-y-6">
            <ContractNFList contractId={fullContract.id} />
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
                console.log("Editar contrato:", fullContract.id);
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
                console.log("Ver compras do contrato:", fullContract.id);
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
