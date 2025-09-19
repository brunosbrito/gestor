import { BudgetImportResult } from '@/types';
import { apiUpload } from '@/lib/api';

export const budgetService = {
  // Parse QQP_Cliente spreadsheet using backend API
  parseSpreadsheet: async (file: File): Promise<BudgetImportResult> => {
    try {
      // Validar tipo de arquivo
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.ms-excel.sheet.macroEnabled.12' // .xlsm
      ];

      if (!validTypes.includes(file.type)) {
        throw new Error('Arquivo deve ser Excel (.xlsx, .xls ou .xlsm) com sheet QQP_Cliente');
      }

      // Chamar API do backend para processar arquivo
      const response = await apiUpload<BudgetImportResult>('/import/budget/excel?sheet_name=QQP_Cliente', file);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao processar arquivo QQP_Cliente');
    }
  },

  // Validar se arquivo tem extensão Excel
  isValidExcelFile: (fileName: string): boolean => {
    const validExtensions = ['.xlsx', '.xls', '.xlsm'];
    return validExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  },

  // Validar presença da sheet QQP_Cliente (será validado no backend)
  validateQQPClienteSheet: (file: File): Promise<boolean> => {
    // Esta validação será feita no backend
    // Aqui apenas verificamos a extensão
    return Promise.resolve(budgetService.isValidExcelFile(file.name));
  }
};