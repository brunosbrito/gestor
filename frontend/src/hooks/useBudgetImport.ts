import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { budgetService } from '@/services/budgetService';
import { BudgetImportResult } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useBudgetImport = () => {
  const [importResult, setImportResult] = useState<BudgetImportResult | null>(null);
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: (file: File) => budgetService.parseSpreadsheet(file),
    onSuccess: (result) => {
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Importação realizada",
          description: `${result.items.length} itens importados com sucesso`,
        });
      } else {
        toast({
          title: "Erro na importação",
          description: result.errors.join(', '),
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao importar planilha",
        variant: "destructive",
      });
    },
  });

  const clearImport = () => {
    setImportResult(null);
  };

  return {
    importSpreadsheet: importMutation.mutate,
    isImporting: importMutation.isPending,
    importResult,
    clearImport,
    error: importMutation.error
  };
};