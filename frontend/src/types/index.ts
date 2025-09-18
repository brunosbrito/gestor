// Core entity types
export type ContractType = 'material' | 'service';

export interface Contract {
  id: number;
  name: string;
  client: string;
  value: number;
  spent: number;
  progress: number;
  status: 'Em Andamento' | 'Finalizando' | 'Concluído' | 'Pausado';
  startDate: string;
  endDate?: string;
  contractType?: ContractType;
  predictedBudget?: BudgetItem[];
  hasBudgetImport?: boolean;
}

export interface BudgetItem {
  id: string;
  description: string;
  category: string;
  costCenter?: string;
  // Material/Produto fields
  quantity?: number;
  unit?: string;
  weight?: number;
  unitValue?: number;
  // Service fields  
  hours?: number;
  hourlyRate?: number;
  serviceType?: string;
  totalValue: number;
}

export interface BudgetImportResult {
  success: boolean;
  items: BudgetItem[];
  contractType: ContractType;
  totalValue: number;
  errors: string[];
  warnings: string[];
}

export interface Purchase {
  id: number;
  item: string;
  supplier: string;
  contract: string;
  orderNumber: string;
  value: number;
  status: 'Pendente' | 'Aprovado' | 'Entregue' | 'Cancelado';
  date: string;
}

export interface Account {
  id: number;
  contractName: string;
  totalValue: number;
  spent: number;
  balance: number;
  executionPercentage: number;
  status: 'Normal' | 'Atenção' | 'Crítico';
  lastUpdate: string;
}

export interface Report {
  id: number;
  name: string;
  contract: string;
  type: 'Analítico' | 'Conta Corrente' | 'Dashboard';
  date: string;
  size: string;
  status: 'Processando' | 'Finalizado' | 'Erro' | 'Disponível';
}

export interface Goal {
  id: number;
  contractName: string;
  targetReduction: number;
  currentReduction: number;
  achievedSavings: number;
  status: 'progress' | 'achieved' | 'exceeded';
  achievement: number;
}

export interface Analytics {
  roi: number;
  averageQuoteTime: number;
  activeSuppliers: number;
  accumulatedSavings: number;
  costEvolution: Array<{ month: string; value: number }>;
  supplierPerformance: Array<{ name: string; score: number }>;
  insights: {
    positive: string[];
    attention: string[];
  };
  recommendations: Array<{ title: string; description: string }>;
}

export interface Activity {
  id: number;
  type: 'purchase' | 'contract' | 'report' | 'nf';
  description: string;
  date: string;
  status: string;
  value?: number;
}

export interface KPI {
  title: string;
  value: number | string;
  format: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down';
  trendValue?: string;
}

// NF (Nota Fiscal) related types
export interface NotaFiscal {
  id: number;
  number: string;
  series: string;
  supplier: string;
  contract?: string;
  contractId?: number; // Vinculação direta com contrato
  value: number;
  items: NFItem[];
  date: string;
  status: 'Pendente' | 'Validada' | 'Rejeitada' | 'Processada';
  xmlFile?: string;
  pdfFile?: string;
}

export interface NFItem {
  id: number;
  description: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  ncm?: string;
  budgetItemId?: string; // Vinculação com item do orçamento previsto
  costCenterId?: string; // Centro de custo classificado
  classificationScore?: number; // Confiança da classificação automática
  classificationSource?: 'manual' | 'rule' | 'ai'; // Origem da classificação
  unit?: string;
  weight?: number;
}

export interface NFImportResult {
  success: boolean;
  notasFiscais: NotaFiscal[];
  errors: string[];
  warnings: string[];
}

// OneDrive integration types
export interface OneDriveFile {
  id: string;
  name: string;
  path: string;
  size: number;
  lastModified: string;
  type: 'nf' | 'contract' | 'report' | 'other';
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface OneDriveSync {
  id: number;
  status: 'running' | 'completed' | 'error';
  filesProcessed: number;
  totalFiles: number;
  startTime: string;
  endTime?: string;
  errors: string[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Chat types
export interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  type?: 'text' | 'action' | 'analysis';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: any;
  action: string;
}

// Budget Realization types
export interface BudgetRealization {
  budgetItemId: string;
  predictedValue: number;
  realizedValue: number;
  predictedQuantity?: number;
  realizedQuantity?: number;
  variance: number;
  variancePercent: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'over_budget';
  linkedNFs: {
    nfId: number;
    nfItemId: number;
    value: number;
    quantity: number;
    date: string;
  }[];
}

export interface ContractExecution {
  contractId: number;
  totalPredictedValue: number;
  totalRealizedValue: number;
  physicalProgress: number;
  financialProgress: number;
  items: BudgetRealization[];
  lastUpdate: string;
  alerts: ExecutionAlert[];
}

export interface ExecutionAlert {
  id: string;
  type: 'budget_exceeded' | 'variance_high' | 'progress_delayed' | 'missing_nf';
  severity: 'low' | 'medium' | 'high';
  message: string;
  budgetItemId?: string;
  suggestedAction?: string;
}

export interface NFToBudgetSuggestion {
  nfItemId: number;
  budgetItemId: string;
  confidenceScore: number; // 0-100
  reason: string;
  similarityFactors: {
    description: number;
    category: number;
    value: number;
  };
}

export interface BudgetLinkingResult {
  success: boolean;
  linkedItems: {
    nfItemId: number;
    budgetItemId: string;
  }[];
  warnings: string[];
  errors: string[];
}

// Cost Center and Classification Types
export interface CostCenter {
  id: string;
  name: string;
  description: string;
  category: 'material' | 'labor' | 'equipment' | 'service' | 'overhead';
  keywords: string[];
  color?: string;
  active: boolean;
  parentId?: string; // For hierarchical cost centers
  budget?: {
    allocated: number;
    consumed: number;
    remaining: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassificationRule {
  id: string;
  name: string;
  costCenterId: string;
  conditions: Array<{
    field: 'description' | 'supplier' | 'value' | 'ncm' | 'quantity';
    operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'regex';
    value: string | number;
    caseSensitive?: boolean;
  }>;
  priority: number; // Higher number = higher priority
  active: boolean;
  hitCount?: number; // Number of times rule has been applied
  successRate?: number; // Success rate of manual validation
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
  manualOverride?: boolean;
}

export interface ClassificationResult {
  itemId: number;
  itemDescription: string;
  suggestedCostCenter?: string;
  suggestions: ClassificationSuggestion[];
  autoClassified: boolean;
  confidence: number;
  appliedRuleId?: string;
  manuallyVerified?: boolean;
  timestamp: string;
}

export interface ClassificationStats {
  totalItems: number;
  classified: number;
  needsReview: number;
  accuracyScore?: number;
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
    accuracyScore?: number;
  }>;
  rulePerformance: Array<{
    ruleId: string;
    ruleName: string;
    hitCount: number;
    successRate: number;
  }>;
}

// Enhanced NF Import with Classification
export interface EnhancedNFImportResult extends NFImportResult {
  classificationResults?: Array<{
    nfId: number;
    itemsClassified: number;
    needsReview: number;
    suggestions: Array<{
      itemId: number;
      costCenter: string;
      confidence: number;
    }>;
  }>;
  importSettings: {
    autoClassify: boolean;
    contractId?: number;
    costCenterRules?: Array<{
      keyword: string;
      costCenter: string;
    }>;
  };
}

// Quotation and Purchase Management Types
export interface Quotation {
  id: number;
  purchaseRequestId: number;
  supplierId: number;
  supplierName: string;
  items: QuotationItem[];
  totalValue: number;
  validUntil: string;
  status: 'pending' | 'submitted' | 'selected' | 'rejected';
  notes?: string;
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface QuotationItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
  brand?: string;
  model?: string;
  deliveryTime?: number; // in days
}

export interface PurchaseRequest {
  id: number;
  contractId: number;
  contractName: string;
  requestedBy: string;
  department: string;
  items: PurchaseRequestItem[];
  totalEstimatedValue: number;
  justification: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requiredDeliveryDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'in_quotation' | 'completed' | 'rejected';
  quotations: Quotation[];
  selectedQuotationId?: number;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequestItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
  estimatedTotalPrice: number;
  specifications: string;
  budgetItemId?: string;
  costCenterId?: string;
}

export interface Supplier {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  categories: string[]; // Types of products/services they provide
  rating: number; // 1-5 stars
  isActive: boolean;
  isApproved: boolean;
  paymentTerms: string;
  deliveryTerms: string;
  certifications: Array<{
    name: string;
    number: string;
    validUntil: string;
    fileUrl?: string;
  }>;
  performanceHistory: {
    totalOrders: number;
    onTimeDelivery: number; // percentage
    qualityScore: number; // 1-5
    averageResponseTime: number; // hours
    priceCompetitiveness: number; // percentage vs average
  };
  contacts: Array<{
    name: string;
    role: string;
    email: string;
    phone: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Audit and History Types
export interface AuditLog {
  id: string;
  entityType: 'nf' | 'contract' | 'purchase' | 'classification' | 'budget';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'classify' | 'link';
  userId: string;
  userName: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

// Advanced Reporting Types
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'analytical' | 'summary' | 'dashboard' | 'compliance';
  category: 'contract' | 'purchase' | 'financial' | 'operational';
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'currency' | 'percentage';
    required: boolean;
    defaultValue?: any;
  }>;
  filters: Array<{
    field: string;
    label: string;
    type: 'select' | 'date_range' | 'number_range' | 'text';
    options?: Array<{
      value: string;
      label: string;
    }>;
  }>;
  groupBy?: string[];
  sortBy?: string[];
  formatOptions: {
    includeCharts: boolean;
    includeImages: boolean;
    pageOrientation: 'portrait' | 'landscape';
    headerImage?: string;
    footerText?: string;
  };
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  filters: Record<string, any>;
  generatedBy: string;
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: number;
  expiresAt?: string;
  downloadCount: number;
  error?: string;
}