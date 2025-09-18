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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePurchase } from "@/hooks/usePurchases";
import { Plus } from "lucide-react";

export const CreatePurchaseModal = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    item: "",
    supplier: "",
    contract: "",
    orderNumber: "",
    value: ""
  });
  
  const createPurchase = useCreatePurchase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate order number
    const orderNumber = `OC-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    
    createPurchase.mutate({
      item: formData.item,
      supplier: formData.supplier,
      contract: formData.contract,
      orderNumber: orderNumber,
      value: parseFloat(formData.value),
      status: "Pendente",
      date: new Date().toISOString().split('T')[0]
    }, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ item: "", supplier: "", contract: "", orderNumber: "", value: "" });
      }
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="premium">
          <Plus className="h-4 w-4" />
          Nova Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Compra</DialogTitle>
          <DialogDescription>
            Preencha as informações da nova compra
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item">Descrição do Item</Label>
            <Input
              id="item"
              value={formData.item}
              onChange={(e) => handleChange("item", e.target.value)}
              placeholder="Ex: Vergalhões 12mm - 10 toneladas"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => handleChange("supplier", e.target.value)}
              placeholder="Ex: Siderúrgica XYZ"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract">Contrato</Label>
            <Select value={formData.contract} onValueChange={(value) => handleChange("contract", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Edifício Residencial - Zona Sul">Edifício Residencial - Zona Sul</SelectItem>
                <SelectItem value="Complexo Comercial - Centro">Complexo Comercial - Centro</SelectItem>
                <SelectItem value="Infraestrutura Urbana - Norte">Infraestrutura Urbana - Norte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor Total (R$)</Label>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) => handleChange("value", e.target.value)}
              placeholder="85000"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createPurchase.isPending}>
              {createPurchase.isPending ? "Criando..." : "Criar Compra"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};