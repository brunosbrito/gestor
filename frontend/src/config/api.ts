// API Configuration
export const API_CONFIG = {
  // Base URL for the backend API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',

  // Timeout for API requests (in milliseconds)
  TIMEOUT: 30000,

  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },

  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      ME: '/auth/me',
    },

    // Contracts
    CONTRACTS: {
      LIST: '/contracts',
      CREATE: '/contracts',
      GET: (id: number) => `/contracts/${id}`,
      UPDATE: (id: number) => `/contracts/${id}`,
      DELETE: (id: number) => `/contracts/${id}`,
      METRICS: (id: number) => `/contracts/${id}/metrics`,
    },

    // Purchases
    PURCHASES: {
      SUPPLIERS: {
        LIST: '/purchases/suppliers',
        CREATE: '/purchases/suppliers',
        APPROVE: (id: number) => `/purchases/suppliers/${id}/approve`,
      },
      ORDERS: {
        LIST: '/purchases/orders',
        CREATE: '/purchases/orders',
        GET: (id: number) => `/purchases/orders/${id}`,
      },
      INVOICES: {
        LIST: '/purchases/invoices',
        CREATE: '/purchases/invoices',
      },
    },

    // Reports
    REPORTS: {
      GENERATE: '/reports/generate',
      DOWNLOAD: (filename: string) => `/reports/download/${filename}`,
      ANALYTICAL_PREVIEW: '/reports/analytical/preview',
      BALANCE_PREVIEW: '/reports/balance/preview',
    },

    // Dashboards
    DASHBOARDS: {
      SUPPLIES: '/dashboards/supplies',
      EXECUTIVE: '/dashboards/executive',
      KPIS_SUMMARY: '/dashboards/kpis/summary',
    },

    // Import
    IMPORT: {
      VALIDATE_FILE: '/import/validate-file',
      BUDGET_EXCEL: '/import/budget/excel',
      INVOICE_XML: '/import/invoice/xml',
      INVOICE_EXCEL: '/import/invoice/excel',
      BULK_INVOICES: '/import/bulk/invoices',
    },
  },
};

// Environment-specific configurations
export const getApiConfig = () => {
  const env = import.meta.env.MODE || 'development';

  const configs = {
    development: {
      ...API_CONFIG,
      BASE_URL: 'http://localhost:8000/api/v1',
    },
    production: {
      ...API_CONFIG,
      BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://apigestorcustos.gmxindustrial.com.br/api/v1',
    },
  };

  return configs[env as keyof typeof configs] || configs.development;
};