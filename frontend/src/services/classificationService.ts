import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { ApiResponse } from '@/types';

// Cost Center types
export interface CostCenter {
  id: string;
  name: string;
  description: string;
  category: 'material' | 'labor' | 'equipment' | 'service' | 'overhead';
  keywords: string[];
  color?: string;
  active: boolean;
}

export interface ClassificationRule {
  id: string;
  name: string;
  costCenterId: string;
  conditions: Array<{
    field: 'description' | 'supplier' | 'value' | 'ncm';
    operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
    value: string | number;
    caseSensitive?: boolean;
  }>;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassificationSuggestion {
  costCenterId: string;
  costCenterName: string;
  confidence: number;
  reasons: Array<{
    rule?: string;
    keyword?: string;
    similarity?: number;
    description: string;
  }>;
}

export interface ClassificationResult {
  itemId: number;
  itemDescription: string;
  suggestedCostCenter?: string;
  suggestions: ClassificationSuggestion[];
  autoClassified: boolean;
  confidence: number;
}

export const classificationService = {
  // Cost Centers Management
  getCostCenters: (params?: { skip?: number; limit?: number; active_only?: boolean }): Promise<ApiResponse<{
    cost_centers: CostCenter[];
    total: number;
    page: number;
    per_page: number;
  }>> => {
    return apiGet('/classification/cost-centers', params);
  },

  createCostCenter: (costCenter: Omit<CostCenter, 'id'>): Promise<ApiResponse<CostCenter>> => {
    return apiPost<CostCenter>('/classification/cost-centers', costCenter);
  },

  // Classification Rules
  getClassificationRules: (params?: { skip?: number; limit?: number; active_only?: boolean }): Promise<ApiResponse<{
    rules: ClassificationRule[];
    total: number;
    page: number;
    per_page: number;
  }>> => {
    return apiGet('/classification/rules', params);
  },

  createClassificationRule: (rule: Omit<ClassificationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ClassificationRule>> => {
    return apiPost<ClassificationRule>('/classification/rules', rule);
  },

  // Classification Statistics
  getClassificationStats: (periodDays?: number): Promise<ApiResponse<{
    totalItems: number;
    classified: number;
    needsReview: number;
    accuracyScore: number;
    topCostCenters: Array<{
      costCenterId: string;
      name: string;
      itemCount: number;
      totalValue: number;
      percentage: number;
    }>;
    recentActivity: Array<{
      date: string;
      itemsClassified: number;
      accuracyScore: number;
    }>;
    rulePerformance: Array<{
      ruleId: string;
      ruleName: string;
      hitCount: number;
      successRate: number;
    }>;
  }>> => {
    const params = periodDays ? { period_days: periodDays } : undefined;
    return apiGet('/classification/stats', params);
  },

  // Auto Classification
  classifyItems: (items: Array<{
    id?: number | string;
    description: string;
    value?: number;
    supplier?: string;
  }>, autoApply?: boolean): Promise<ApiResponse<{
    results: ClassificationResult[];
    total_classified: number;
    total_items: number;
    success: boolean;
  }>> => {
    const params = autoApply ? { auto_apply: autoApply } : undefined;
    return apiPost('/classification/classify', { items }, params);
  },

  // Manual Classification
  classifySingleItem: (itemId: number, costCenterId: string, confidence?: number): Promise<ApiResponse<{
    itemId: number;
    costCenterId: string;
    confidence: number;
    classifiedAt: string;
    source: string;
    message: string;
  }>> => {
    return apiPut(`/classification/items/${itemId}/classify`, {
      cost_center_id: costCenterId,
      confidence: confidence || 100.0
    });
  },


  // Utility functions for client-side classification hints
  getKeywordSuggestions: (description: string): ClassificationSuggestion[] => {
    const keywords = {
      'estrutura': { costCenter: 'Estrutura', confidence: 0.9, category: 'material' },
      'vergalhao': { costCenter: 'Estrutura', confidence: 0.95, category: 'material' },
      'concreto': { costCenter: 'Estrutura', confidence: 0.95, category: 'material' },
      'cimento': { costCenter: 'Estrutura', confidence: 0.9, category: 'material' },
      'alvenaria': { costCenter: 'Alvenaria', confidence: 0.9, category: 'material' },
      'tijolo': { costCenter: 'Alvenaria', confidence: 0.95, category: 'material' },
      'reboco': { costCenter: 'Acabamento', confidence: 0.8, category: 'material' },
      'tinta': { costCenter: 'Acabamento', confidence: 0.9, category: 'material' },
      'pintura': { costCenter: 'Acabamento', confidence: 0.9, category: 'service' },
      'eletrica': { costCenter: 'Instalações Elétricas', confidence: 0.9, category: 'material' },
      'fio': { costCenter: 'Instalações Elétricas', confidence: 0.85, category: 'material' },
      'cabo': { costCenter: 'Instalações Elétricas', confidence: 0.85, category: 'material' },
      'hidraulica': { costCenter: 'Instalações Hidráulicas', confidence: 0.9, category: 'material' },
      'tubo': { costCenter: 'Instalações Hidráulicas', confidence: 0.8, category: 'material' },
      'conexao': { costCenter: 'Instalações Hidráulicas', confidence: 0.8, category: 'material' },
      'pedreiro': { costCenter: 'Mão de Obra', confidence: 0.95, category: 'labor' },
      'servente': { costCenter: 'Mão de Obra', confidence: 0.95, category: 'labor' },
      'mestre': { costCenter: 'Mão de Obra', confidence: 0.9, category: 'labor' },
      'equipamento': { costCenter: 'Equipamentos', confidence: 0.8, category: 'equipment' },
      'betoneira': { costCenter: 'Equipamentos', confidence: 0.95, category: 'equipment' },
      'guincho': { costCenter: 'Equipamentos', confidence: 0.95, category: 'equipment' },
      'transporte': { costCenter: 'Mobilização', confidence: 0.9, category: 'service' },
      'frete': { costCenter: 'Mobilização', confidence: 0.9, category: 'service' }
    };

    const descriptionLower = description.toLowerCase();
    const suggestions: ClassificationSuggestion[] = [];

    Object.entries(keywords).forEach(([keyword, data]) => {
      if (descriptionLower.includes(keyword)) {
        suggestions.push({
          costCenterId: data.costCenter.toLowerCase().replace(/ /g, '_'),
          costCenterName: data.costCenter,
          confidence: data.confidence,
          reasons: [{
            keyword,
            description: `Palavra-chave "${keyword}" identificada na descrição`
          }]
        });
      }
    });

    // Sort by confidence
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  },

  // Validate classification rules
  validateRule: (rule: Omit<ClassificationRule, 'id' | 'createdAt' | 'updatedAt'>): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rule.name.trim()) {
      errors.push('Nome da regra é obrigatório');
    }

    if (!rule.costCenterId) {
      errors.push('Centro de custo é obrigatório');
    }

    if (rule.conditions.length === 0) {
      errors.push('Pelo menos uma condição é obrigatória');
    }

    rule.conditions.forEach((condition, index) => {
      if (!condition.field) {
        errors.push(`Condição ${index + 1}: Campo é obrigatório`);
      }

      if (!condition.operator) {
        errors.push(`Condição ${index + 1}: Operador é obrigatório`);
      }

      if (!condition.value && condition.value !== 0) {
        errors.push(`Condição ${index + 1}: Valor é obrigatório`);
      }

      if (typeof condition.value === 'string' && condition.value.trim() === '') {
        errors.push(`Condição ${index + 1}: Valor não pode ser vazio`);
      }
    });

    if (rule.priority < 0 || rule.priority > 100) {
      warnings.push('Prioridade deveria estar entre 0 e 100');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
};