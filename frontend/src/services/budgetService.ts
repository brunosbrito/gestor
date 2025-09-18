import { BudgetImportResult, BudgetItem, ContractType } from '@/types';

export const budgetService = {
  // Parse spreadsheet and extract budget items
  parseSpreadsheet: (file: File): Promise<BudgetImportResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          // For demo purposes, we'll simulate parsing an Excel file
          // In a real implementation, you'd use a library like xlsx
          const mockResult = parseMockSpreadsheet();
          
          setTimeout(() => {
            resolve(mockResult);
          }, 1000); // Simulate processing time
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  },

  // Detect contract type based on budget items
  detectContractType: (items: BudgetItem[]): ContractType => {
    // Simple heuristic: if more than 50% of items have quantity/unit, it's material
    const materialItems = items.filter(item => item.quantity && item.unit);
    const serviceItems = items.filter(item => item.hours || item.serviceType);
    
    return materialItems.length > serviceItems.length ? 'material' : 'service';
  },

  // Validate budget items
  validateBudgetItems: (items: BudgetItem[], contractType: ContractType): { errors: string[], warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    items.forEach((item, index) => {
      if (!item.description.trim()) {
        errors.push(`Item ${index + 1}: Descrição é obrigatória`);
      }
      
      if (item.totalValue <= 0) {
        errors.push(`Item ${index + 1}: Valor total deve ser maior que zero`);
      }
      
      if (contractType === 'material') {
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantidade é obrigatória para contratos de material`);
        }
        if (!item.unit) {
          warnings.push(`Item ${index + 1}: Unidade não informada`);
        }
      }
      
      if (contractType === 'service') {
        if (!item.hours || item.hours <= 0) {
          warnings.push(`Item ${index + 1}: Horas não informadas para serviço`);
        }
      }
    });
    
    return { errors, warnings };
  }
};

// Mock data for demonstration
function parseMockSpreadsheet(): BudgetImportResult {
  const items: BudgetItem[] = [
    {
      id: '1',
      description: 'Cimento Portland CP II-E-32',
      category: 'Materiais Básicos',
      costCenter: 'Estrutura',
      quantity: 1000,
      unit: 'saco 50kg',
      weight: 50000,
      unitValue: 35.50,
      totalValue: 35500
    },
    {
      id: '2', 
      description: 'Aço CA-50 12mm',
      category: 'Materiais Básicos',
      costCenter: 'Estrutura',
      quantity: 500,
      unit: 'kg',
      weight: 500,
      unitValue: 8.75,
      totalValue: 4375
    },
    {
      id: '3',
      description: 'Serviço de Concretagem',
      category: 'Mão de Obra',
      costCenter: 'Estrutura',
      hours: 120,
      hourlyRate: 45.00,
      serviceType: 'Concretagem',
      totalValue: 5400
    }
  ];
  
  const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
  const contractType = budgetService.detectContractType(items);
  const validation = budgetService.validateBudgetItems(items, contractType);
  
  return {
    success: true,
    items,
    contractType,
    totalValue,
    errors: validation.errors,
    warnings: validation.warnings
  };
}