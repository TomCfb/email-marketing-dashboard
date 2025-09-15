// Core Dashboard Types
export interface DashboardConfig {
  refreshInterval: number;
  maxDataPoints: number;
  defaultDateRange: number;
  enableRealTime: boolean;
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
}

// API Response Types
export interface KlaviyoApiResponse<T> {
  data: T;
  links?: {
    self?: string;
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

export interface KlaviyoProfile {
  type: 'profile';
  id: string;
  attributes: {
    email?: string;
    phone_number?: string;
    external_id?: string;
    first_name?: string;
    last_name?: string;
    organization?: string;
    locale?: string;
    title?: string;
    image?: string;
    created?: string;
    updated?: string;
    last_event_date?: string;
    location?: {
      address1?: string;
      address2?: string;
      city?: string;
      country?: string;
      latitude?: string;
      longitude?: string;
      region?: string;
      zip?: string;
      timezone?: string;
      ip?: string;
    };
    properties?: Record<string, unknown>;
    predictive_analytics?: {
      historic_clv?: number;
      predicted_clv?: number;
      total_clv?: number;
      historic_number_of_orders?: number;
      predicted_number_of_orders?: number;
      average_days_between_orders?: number;
      average_order_value?: number;
      churn_probability?: number;
      expected_date_of_next_order?: string;
    };
  };
  relationships?: {
    lists?: {
      data?: Array<{
        type: 'list';
        id: string;
      }>;
    };
    segments?: {
      data?: Array<{
        type: 'segment';
        id: string;
      }>;
    };
  };
}

export interface KlaviyoCampaignApiResponse {
  type: 'campaign';
  id: string;
  attributes: {
    name?: string;
    subject_line?: string;
    status?: 'draft' | 'queued' | 'sending' | 'sent' | 'paused' | 'cancelled';
    archived?: boolean;
    audiences?: {
      included?: Array<{
        type: string;
        id: string;
      }>;
      excluded?: Array<{
        type: string;
        id: string;
      }>;
    };
    send_options?: {
      use_smart_sending?: boolean;
      is_transactional?: boolean;
    };
    tracking_options?: {
      is_tracking_clicks?: boolean;
      is_tracking_opens?: boolean;
      is_add_utm?: boolean;
      utm_params?: Array<{
        name: string;
        value: string;
      }>;
    };
    send_strategy?: {
      method: 'immediate' | 'throttled' | 'smart_send_time';
      options_static?: {
        datetime: string;
        is_local: boolean;
        send_past_recipients_immediately: boolean;
      };
      options_throttled?: {
        datetime: string;
        throttle_percentage: number;
      };
      options_sto?: {
        date: string;
      };
    };
    statistics?: {
      recipients?: number;
      unique_opens?: number;
      unique_clicks?: number;
      revenue?: number;
      open_rate?: number;
      click_rate?: number;
    };
    created_at?: string;
    scheduled_at?: string;
    updated_at?: string;
    send_time?: string;
  };
  relationships?: {
    campaign_messages?: {
      data?: Array<{
        type: 'campaign-message';
        id: string;
      }>;
    };
    tags?: {
      data?: Array<{
        type: 'tag';
        id: string;
      }>;
    };
  };
}

export interface KlaviyoFlowApiResponse {
  type: 'flow';
  id: string;
  attributes: {
    name?: string;
    status?: 'active' | 'paused' | 'draft';
    archived?: boolean;
    created?: string;
    updated?: string;
    trigger_type?: string;
    statistics?: {
      revenue?: number;
      conversion_rate?: number;
      subscriber_count?: number;
    };
  };
  relationships?: {
    'flow-actions'?: {
      data?: Array<{
        type: 'flow-action';
        id: string;
      }>;
    };
    tags?: {
      data?: Array<{
        type: 'tag';
        id: string;
      }>;
    };
  };
}

export interface KlaviyoSegmentApiResponse {
  type: 'segment';
  id: string;
  attributes: {
    name?: string;
    definition?: Record<string, unknown>;
    created?: string;
    updated?: string;
    is_active?: boolean;
    is_processing?: boolean;
    is_starred?: boolean;
    profile_count?: number;
    estimated_count?: number;
  };
  relationships?: {
    tags?: {
      data?: Array<{
        type: 'tag';
        id: string;
      }>;
    };
    profiles?: {
      data?: Array<{
        type: 'profile';
        id: string;
      }>;
    };
  };
}

export interface TripleWhaleApiOrder {
  id: string;
  customer_id?: string;
  email?: string;
  total_price?: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
  order_number?: string;
  financial_status?: string;
  fulfillment_status?: string;
  tags?: string[];
  line_items?: any[];
  shipping_address?: any;
  billing_address?: any;
  customer_accepts_marketing?: boolean;
  source_name?: string;
}

export interface TripleWhaleApiCustomer {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  orders_count?: number;
  total_spent?: number;
  created_at?: string;
  updated_at?: string;
  accepts_marketing?: boolean;
  tags?: string[];
}

export interface TripleWhaleApiSummary {
  total_revenue?: number;
  conversion_rate?: number;
  customer_lifetime_value?: number;
  ad_spend?: number;
  roas?: number;
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
  subscribers: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  activeFlows: number;
  totalCampaigns: number;
  avgOrderValue: number;
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
  averageOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
  conversionRate: number;
  customerLifetimeValue: number;
  adSpend: number;
  roas: number;
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
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  averageOrderValue: number;
  createdAt: string;
  updatedAt: string;
  acceptsMarketing: boolean;
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
