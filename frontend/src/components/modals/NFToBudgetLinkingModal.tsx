import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Link, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  FileSpreadsheet,
  Receipt
} from "lucide-react";
import { NotaFiscal, BudgetItem, NFToBudgetSuggestion } from "@/types";
import { useLinkNFToBudget } from "@/hooks/useRealization";
import { realizationService } from "@/services/realizationService";

interface NFToBudgetLinkingModalProps {
  notaFiscal: NotaFiscal;
  budgetItems: BudgetItem[];
  contractId: number;
  children: React.ReactNode;
}

interface NFItemLink {
  nfItemId: number;
  budgetItemId: string | null;
  isManual: boolean;
}

export const NFToBudgetLinkingModal = ({ 
  notaFiscal, 
  budgetItems, 
  contractId, 
  children 
}: NFToBudgetLinkingModalProps) => {
  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("automatic");
  const [suggestions, setSuggestions] = useState<NFToBudgetSuggestion[]>([]);
  const [links, setLinks] = useState<NFItemLink[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const linkMutation = useLinkNFToBudget();

  useEffect(() => {
    if (open) {
      // Initialize links for all NF items
      const initialLinks: NFItemLink[] = notaFiscal.items.map(item => ({
        nfItemId: item.id,
        budgetItemId: item.budgetItemId || null,
        isManual: !!item.budgetItemId
      }));
      setLinks(initialLinks);

      // Generate AI suggestions
      generateSuggestions();
    }
  }, [open, notaFiscal, budgetItems]);

  const generateSuggestions = () => {
    setIsProcessing(true);
    
    // Simulate AI suggestions using the mock function
    const aiSuggestions = realizationService.simulateAIMatching(
      notaFiscal.items, 
      budgetItems
    );
    
    setSuggestions(aiSuggestions);
    
    // Apply automatic suggestions with high confidence
    const autoLinks = links.map(link => {
      if (link.budgetItemId) return link; // Already linked
      
      const bestSuggestion = aiSuggestions.find(
        s => s.nfItemId === link.nfItemId && s.confidenceScore >= 85
      );
      
      return bestSuggestion ? {
        ...link,
        budgetItemId: bestSuggestion.budgetItemId,
        isManual: false
      } : link;
    });
    
    setLinks(autoLinks);
    setIsProcessing(false);
  };

  const handleApplySuggestion = (nfItemId: number, budgetItemId: string) => {
    setLinks(prev => prev.map(link => 
      link.nfItemId === nfItemId 
        ? { ...link, budgetItemId, isManual: false }
        : link
    ));
  };

  const handleManualLink = (nfItemId: number, budgetItemId: string | null) => {
    setLinks(prev => prev.map(link => 
      link.nfItemId === nfItemId 
        ? { ...link, budgetItemId, isManual: true }
        : link
    ));
  };

  const handleSaveLinks = () => {
    const validLinks = links
      .filter(link => link.budgetItemId)
      .map(link => ({
        nfItemId: link.nfItemId,
        budgetItemId: link.budgetItemId!
      }));

    linkMutation.mutate({
      nfId: notaFiscal.id,
      contractId,
      links: validLinks
    }, {
      onSuccess: () => {
        setOpen(false);
      }
    });
  };

  const getLinkedCount = () => links.filter(link => link.budgetItemId).length;
  const getTotalCount = () => notaFiscal.items.length;
  const getProgressPercent = () => (getLinkedCount() / getTotalCount()) * 100;

  const getSuggestionForItem = (nfItemId: number) => {
    return suggestions.find(s => s.nfItemId === nfItemId);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 85) return <Badge className="bg-green-100 text-green-800">Alta</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>;
    return <Badge className="bg-red-100 text-red-800">Baixa</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Vincular Nota Fiscal ao Orçamento
          </DialogTitle>
          <DialogDescription>
            NF {notaFiscal.number} - {notaFiscal.supplier} • Valor: R$ {notaFiscal.value.toLocaleString('pt-BR')}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Progresso da Vinculação</span>
              <Badge variant={getLinkedCount() === getTotalCount() ? "default" : "secondary"}>
                {getLinkedCount()}/{getTotalCount()} itens
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getProgressPercent()} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Itens vinculados</span>
              <span>{Math.round(getProgressPercent())}% completo</span>
            </div>
          </CardContent>
        </Card>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="automatic" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Sugestões Automáticas
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Vinculação Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="automatic" className="space-y-4">
            {isProcessing ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Analisando itens com IA...</p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[400px] space-y-4">
                <div className="space-y-4">
                  {notaFiscal.items.map(nfItem => {
                    const suggestion = getSuggestionForItem(nfItem.id);
                    const currentLink = links.find(l => l.nfItemId === nfItem.id);
                    const linkedBudgetItem = currentLink?.budgetItemId 
                      ? budgetItems.find(b => b.id === currentLink.budgetItemId)
                      : null;

                    return (
                      <Card key={nfItem.id} className="p-4">
                        <div className="space-y-4">
                          {/* NF Item Info */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                <h4 className="font-medium">{nfItem.description}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Qtd: {nfItem.quantity} • Valor: R$ {nfItem.totalValue.toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          {/* Current Link Status */}
                          {currentLink?.budgetItemId && linkedBudgetItem && (
                            <Alert>
                              <CheckCircle2 className="h-4 w-4" />
                              <AlertDescription>
                                <div className="flex items-center justify-between">
                                  <span>
                                    Vinculado a: <strong>{linkedBudgetItem.description}</strong>
                                  </span>
                                  <Badge variant="outline">
                                    {currentLink.isManual ? 'Manual' : 'Automático'}
                                  </Badge>
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* AI Suggestion */}
                          {suggestion && !currentLink?.budgetItemId && (
                            <div className="border rounded-lg p-4 bg-muted/30">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-primary" />
                                  <span className="font-medium">Sugestão IA</span>
                                  {getConfidenceBadge(suggestion.confidenceScore)}
                                </div>
                                <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidenceScore)}`}>
                                  {suggestion.confidenceScore}% confiança
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <ArrowRight className="h-4 w-4" />
                                  <span className="text-sm">
                                    {budgetItems.find(b => b.id === suggestion.budgetItemId)?.description}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                                
                                <Button
                                  size="sm"
                                  onClick={() => handleApplySuggestion(nfItem.id, suggestion.budgetItemId)}
                                  className="mt-2"
                                >
                                  Aplicar Sugestão
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* No Suggestion Available */}
                          {!suggestion && !currentLink?.budgetItemId && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Nenhuma sugestão automática encontrada. Use a vinculação manual.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <ScrollArea className="h-[400px] space-y-4">
              <div className="space-y-4">
                {notaFiscal.items.map(nfItem => {
                  const currentLink = links.find(l => l.nfItemId === nfItem.id);
                  
                  return (
                    <Card key={nfItem.id} className="p-4">
                      <div className="space-y-4">
                        {/* NF Item Info */}
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          <div className="flex-1">
                            <h4 className="font-medium">{nfItem.description}</h4>
                            <p className="text-sm text-muted-foreground">
                              Qtd: {nfItem.quantity} • Valor: R$ {nfItem.totalValue.toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        {/* Manual Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Vincular ao item do orçamento:</label>
                          <Select
                            value={currentLink?.budgetItemId || ""}
                            onValueChange={(value) => handleManualLink(nfItem.id, value || null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um item do orçamento..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Não vincular</SelectItem>
                              {budgetItems.map(budgetItem => (
                                <SelectItem key={budgetItem.id} value={budgetItem.id}>
                                  <div>
                                    <div className="font-medium">{budgetItem.description}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {budgetItem.category} • R$ {budgetItem.totalValue.toLocaleString('pt-BR')}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveLinks}
            disabled={linkMutation.isPending || getLinkedCount() === 0}
          >
            {linkMutation.isPending ? "Salvando..." : `Salvar Vinculações (${getLinkedCount()})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};