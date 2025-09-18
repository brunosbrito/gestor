import { apiGet, apiPost, apiPut } from '@/lib/api';
import { 
  ContractExecution, 
  BudgetRealization, 
  NFToBudgetSuggestion, 
  BudgetLinkingResult,
  ApiResponse,
  NotaFiscal,
  BudgetItem
} from '@/types';

export const realizationService = {
  // Get contract execution data
  getContractExecution: (contractId: number): Promise<ApiResponse<ContractExecution>> => {
    return apiGet<ContractExecution>(`/contracts/${contractId}/execution`);
  },

  // Generate suggestions for linking NF items to budget items
  generateLinkingSuggestions: (
    nfId: number, 
    contractId: number
  ): Promise<ApiResponse<NFToBudgetSuggestion[]>> => {
    return apiPost<NFToBudgetSuggestion[]>('/nf/suggest-budget-links', { 
      nfId, 
      contractId 
    });
  },

  // Link NF items to budget items
  linkNFToBudget: (linkingData: {
    nfId: number;
    contractId: number;
    links: { nfItemId: number; budgetItemId: string }[];
  }): Promise<ApiResponse<BudgetLinkingResult>> => {
    return apiPost<BudgetLinkingResult>('/nf/link-to-budget', linkingData);
  },

  // Update budget realization manually
  updateRealization: (
    contractId: number,
    budgetItemId: string,
    realization: Partial<BudgetRealization>
  ): Promise<ApiResponse<BudgetRealization>> => {
    return apiPut<BudgetRealization>(
      `/contracts/${contractId}/budget/${budgetItemId}/realization`, 
      realization
    );
  },

  // Get detailed realization for specific budget item
  getBudgetItemRealization: (
    contractId: number,
    budgetItemId: string
  ): Promise<ApiResponse<BudgetRealization>> => {
    return apiGet<BudgetRealization>(
      `/contracts/${contractId}/budget/${budgetItemId}/realization`
    );
  },

  // Recalculate contract execution based on linked NFs
  recalculateExecution: (contractId: number): Promise<ApiResponse<ContractExecution>> => {
    return apiPost<ContractExecution>(`/contracts/${contractId}/recalculate-execution`);
  },

  // Get unlinked NFs for a contract (NFs without budget item association)
  getUnlinkedNFs: (contractId: number): Promise<ApiResponse<NotaFiscal[]>> => {
    return apiGet<NotaFiscal[]>(`/contracts/${contractId}/unlinked-nfs`);
  },

  // Mock function to simulate AI matching between NF items and budget items
  simulateAIMatching: (nfItems: any[], budgetItems: BudgetItem[]): NFToBudgetSuggestion[] => {
    const suggestions: NFToBudgetSuggestion[] = [];

    nfItems.forEach(nfItem => {
      budgetItems.forEach(budgetItem => {
        // Simple similarity calculation based on description
        const descriptionSimilarity = calculateStringSimilarity(
          nfItem.description.toLowerCase(),
          budgetItem.description.toLowerCase()
        );

        // Value similarity (closer values get higher score)
        const valueDiff = Math.abs(nfItem.totalValue - budgetItem.totalValue);
        const maxValue = Math.max(nfItem.totalValue, budgetItem.totalValue);
        const valueSimilarity = maxValue > 0 ? (1 - (valueDiff / maxValue)) * 100 : 0;

        // Category matching (if categories exist)
        const categorySimilarity = nfItem.category === budgetItem.category ? 100 : 0;

        // Overall confidence score
        const confidenceScore = Math.round(
          (descriptionSimilarity * 0.5 + 
           valueSimilarity * 0.3 + 
           categorySimilarity * 0.2)
        );

        // Only suggest if confidence is above threshold
        if (confidenceScore >= 60) {
          suggestions.push({
            nfItemId: nfItem.id,
            budgetItemId: budgetItem.id,
            confidenceScore,
            reason: getMatchReason(confidenceScore, descriptionSimilarity, valueSimilarity),
            similarityFactors: {
              description: Math.round(descriptionSimilarity),
              category: Math.round(categorySimilarity),
              value: Math.round(valueSimilarity)
            }
          });
        }
      });
    });

    // Sort by confidence score (highest first)
    return suggestions.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }
};

// Helper function to calculate string similarity
function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  
  let matches = 0;
  words1.forEach(word1 => {
    if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
      matches++;
    }
  });
  
  return (matches / Math.max(words1.length, words2.length)) * 100;
}

// Helper function to generate match reason
function getMatchReason(confidence: number, description: number, value: number): string {
  if (confidence >= 90) return 'Correspondência muito alta - descrição e valor similares';
  if (confidence >= 80) return 'Boa correspondência - descrição similar';
  if (confidence >= 70) return 'Correspondência razoável - alguns elementos coincidem';
  return 'Correspondência baixa - verificar manualmente';
}