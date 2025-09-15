// Core Dashboard Types
export interface DashboardConfig {
  refreshInterval: number;
  maxDataPoints: number;
  defaultDateRange: number;
  enableRealTime: boolean;
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
}

// Date Range Types
export interface DateRange {
  from: Date;
  to: Date;
}

// Klaviyo Types
export interface KlaviyoMetrics {
  totalRevenue: number;
  emailRevenue: number;
  campaigns: number;
  flows: number;
  subscribers: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  unsubscribeRate: number;
}

export interface KlaviyoCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'sent' | 'scheduled' | 'cancelled';
  sentAt: string;
  recipients: number;
  opens: number;
  clicks: number;
  revenue: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface KlaviyoFlow {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  emails: number;
  revenue: number;
  conversionRate: number;
  subscribers: number;
}

export interface KlaviyoSegment {
  id: string;
  name: string;
  count: number;
  estimatedCount: number;
  isProcessing: boolean;
}

// Triple Whale Types
export interface TripleWhaleMetrics {
  totalRevenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  returnCustomerRate: number;
  newCustomerRate: number;
}

export interface TripleWhaleOrder {
  id: string;
  customerId: string;
  email: string;
  total: number;
  currency: string;
  createdAt: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  items: TripleWhaleOrderItem[];
  source?: string;
  campaign?: string;
}

export interface TripleWhaleOrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface TripleWhaleCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
  lifetimeValue: number;
  tags: string[];
}

// Unified Customer Profile
export interface UnifiedCustomer {
  email: string;
  klaviyoId?: string;
  tripleWhaleId?: string;
  firstName?: string;
  lastName?: string;
  // Klaviyo data
  klaviyoSegments?: string[];
  emailEngagement?: {
    openRate: number;
    clickRate: number;
    lastEngaged: string;
  };
  // Triple Whale data
  orderHistory?: TripleWhaleOrder[];
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lifetimeValue: number;
  // Combined insights
  riskScore?: number;
  engagementScore?: number;
  predictedChurn?: boolean;
}

// Analytics Types
export interface RevenueAttribution {
  emailRevenue: number;
  totalRevenue: number;
  attributionRate: number;
  directAttribution: number;
  assistedAttribution: number;
  campaigns: CampaignAttribution[];
}

export interface CampaignAttribution {
  campaignId: string;
  campaignName: string;
  revenue: number;
  orders: number;
  attributionType: 'direct' | 'assisted' | 'view-through';
}

export interface CohortAnalysis {
  cohortMonth: string;
  customersCount: number;
  retentionRates: number[];
  revenueByMonth: number[];
  averageOrderValue: number[];
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
}

export interface ComparisonChartData {
  klaviyo: ChartDataPoint[];
  tripleWhale: ChartDataPoint[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// MCP Integration Types
export interface MCPConnection {
  endpoint: string;
  apiKey: string;
  isConnected: boolean;
  lastSync: string;
  health: 'healthy' | 'degraded' | 'down';
}

export interface SyncStatus {
  klaviyo: MCPConnection;
  tripleWhale: MCPConnection;
  lastFullSync: string;
  isRunning: boolean;
  progress: number;
}

// UI Component Types
export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  trend?: ChartDataPoint[];
  loading?: boolean;
  error?: string;
}

export interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    column: keyof T;
    direction: 'asc' | 'desc';
    onSort: (column: keyof T, direction: 'asc' | 'desc') => void;
  };
}

// Store Types (Zustand)
export interface DashboardStore {
  // State
  dateRange: DateRange;
  selectedMetrics: string[];
  activeFilters: Record<string, any>;
  syncStatus: SyncStatus;
  
  // Actions
  setDateRange: (range: DateRange) => void;
  setSelectedMetrics: (metrics: string[]) => void;
  setActiveFilters: (filters: Record<string, any>) => void;
  updateSyncStatus: (status: Partial<SyncStatus>) => void;
}

// Query Keys for React Query
export const QueryKeys = {
  klaviyoMetrics: (dateRange: DateRange) => ['klaviyo', 'metrics', dateRange],
  klaviyoCampaigns: (dateRange: DateRange) => ['klaviyo', 'campaigns', dateRange],
  klaviyoFlows: () => ['klaviyo', 'flows'],
  tripleWhaleMetrics: (dateRange: DateRange) => ['tripleWhale', 'metrics', dateRange],
  tripleWhaleOrders: (dateRange: DateRange) => ['tripleWhale', 'orders', dateRange],
  unifiedCustomers: () => ['unified', 'customers'],
  revenueAttribution: (dateRange: DateRange) => ['analytics', 'attribution', dateRange],
} as const;
