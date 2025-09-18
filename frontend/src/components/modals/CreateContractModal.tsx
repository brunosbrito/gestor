import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateContract } from "@/hooks/useContracts";
import { BudgetImportModal } from "./BudgetImportModal";
import { ContractType, BudgetImportResult } from "@/types";
import { Plus, Upload, FileSpreadsheet } from "lucide-react";

export const CreateContractModal = () => {
  const [open, setOpen] = useState(false);
  const [budgetImportOpen, setBudgetImportOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    value: "",
    description: "",
    startDate: "",
    contractType: "" as ContractType | ""
  });
  const [importedBudget, setImportedBudget] = useState<BudgetImportResult | null>(null);
  
  const createContract = useCreateContract();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contractValue = importedBudget ? importedBudget.totalValue : parseFloat(formData.value);
    
    createContract.mutate({
      name: formData.name,
      client: formData.client,
      value: contractValue,
      spent: 0,
      progress: 0,
      status: "Em Andamento",
      startDate: formData.startDate,
      contractType: (formData.contractType as ContractType) || importedBudget?.contractType,
      predictedBudget: importedBudget?.items,
      hasBudgetImport: !!importedBudget
    }, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ name: "", client: "", value: "", description: "", startDate: "", contractType: "" });
        setImportedBudget(null);
      }
    });
  };

  const handleBudgetImport = (result: BudgetImportResult) => {
    setImportedBudget(result);
    setFormData(prev => ({
      ...prev,
      contractType: result.contractType,
      value: result.totalValue.toString()
    }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="premium">
          <Plus className="h-4 w-4" />
          Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Contrato</DialogTitle>
          <DialogDescription>
            Preencha as informações do novo contrato
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Contrato</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: Edifício Residencial - Zona Sul"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) => handleChange("client", e.target.value)}
              placeholder="Ex: Construtora ABC"
              required
            />
          </div>

          {/* Contract Type Selection */}
          <div className="space-y-2">
            <Label>Tipo de Contrato</Label>
            <Select
              value={formData.contractType}
              onValueChange={(value: ContractType) => handleChange("contractType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="material">Material/Produto</SelectItem>
                <SelectItem value="service">Serviço</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Orçamento Previsto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!importedBudget ? (
                <div className="text-center py-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Importe a planilha QQP Cliente para preencher automaticamente o orçamento
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setBudgetImportOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Planilha
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Orçamento Importado</p>
                      <p className="text-xs text-muted-foreground">
                        {importedBudget.items.length} itens • Tipo: {
                          importedBudget.contractType === 'material' ? 'Material/Produto' : 'Serviço'
                        }
                      </p>
                    </div>
                    <Badge variant="secondary">
                      R$ {importedBudget.totalValue.toLocaleString('pt-BR')}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setImportedBudget(null)}
                  >
                    Remover Orçamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor Total (R$)</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => handleChange("value", e.target.value)}
                placeholder="2400000"
                required
                disabled={!!importedBudget}
              />
              {importedBudget && (
                <p className="text-xs text-muted-foreground">
                  Valor calculado automaticamente pela importação
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descrição detalhada do contrato..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createContract.isPending}>
              {createContract.isPending ? "Criando..." : "Criar Contrato"}
            </Button>
          </div>
        </form>
        
        <BudgetImportModal
          open={budgetImportOpen}
          onOpenChange={setBudgetImportOpen}
          onImportComplete={handleBudgetImport}
        />
      </DialogContent>
    </Dialog>
  );
};