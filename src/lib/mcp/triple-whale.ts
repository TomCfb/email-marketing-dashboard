import { TripleWhaleMetrics, TripleWhaleOrder, TripleWhaleCustomer, ApiResponse, DateRange } from '../types';

export class TripleWhaleMCPClient {
  private apiKey: string;
  private endpoint: string;
  private baseUrl: string;

  constructor(apiKey: string, endpoint?: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint || process.env.TRIPLE_WHALE_MCP_ENDPOINT || 'http://localhost:3002/triple-whale';
    this.baseUrl = 'https://api.triplewhale.com/api/v2';
  }

  private async makeRequest<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = this.endpoint ? `${this.endpoint}${path}` : `${this.baseUrl}${path}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Triple Whale API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      data,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async getMetrics(_dateRange: DateRange): Promise<ApiResponse<TripleWhaleMetrics>> {
    try {
      // Return mock data for Triple Whale metrics
      const mockMetrics: TripleWhaleMetrics = {
        totalRevenue: 78500,
        orders: 342,
        averageOrderValue: 229.53,
        newCustomers: 89,
        returningCustomers: 253,
        conversionRate: 3.8,
        customerLifetimeValue: 485.20,
        adSpend: 12400,
        roas: 6.33,
      };

      return {
        data: mockMetrics,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching Triple Whale metrics:', error);
      throw error;
    }
  }

  async getOrders(dateRange: DateRange): Promise<ApiResponse<TripleWhaleOrder[]>> {
    try {
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];

      const response = await this.makeRequest<any>(
        `/orders?start_date=${startDate}&end_date=${endDate}`
      );

      const orders: TripleWhaleOrder[] = response.data?.data?.map((order: any) => ({
        id: order.id,
        customerId: order.customer_id,
        email: order.email,
        totalPrice: order.total_price,
        currency: order.currency,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        orderNumber: order.order_number,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        tags: order.tags || [],
        lineItems: order.line_items || [],
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        customerAcceptsMarketing: order.customer_accepts_marketing,
        source: order.source_name,
      })) || [];

      return {
        data: orders,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching Triple Whale orders:', error);
      throw error;
    }
  }

  async getCustomers(dateRange: DateRange): Promise<ApiResponse<TripleWhaleCustomer[]>> {
    try {
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];

      const response = await this.makeRequest<any>(
        `/customers?start_date=${startDate}&end_date=${endDate}`
      );

      const customers: TripleWhaleCustomer[] = response.data?.data?.map((customerData: any) => {
        const customer: TripleWhaleCustomer = {
          id: customerData.id,
          email: customerData.email,
          firstName: customerData.first_name,
          lastName: customerData.last_name,
          phone: customerData.phone,
          ordersCount: customerData.orders_count,
          totalSpent: customerData.total_spent,
          averageOrderValue: customerData.orders_count > 0 
            ? customerData.total_spent / customerData.orders_count 
            : 0,
          createdAt: customerData.created_at,
          updatedAt: customerData.updated_at,
          acceptsMarketing: customerData.accepts_marketing,
          tags: customerData.tags || [],
        };

        return customer;
      }) || [];

      return {
        data: customers,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching Triple Whale customers:', error);
      throw error;
    }
  }

  async getCustomerById(customerId: string): Promise<ApiResponse<TripleWhaleCustomer>> {
    try {
      const response = await this.makeRequest<any>(`/customers/${customerId}`);
      
      const customer: TripleWhaleCustomer = {
        id: response.data.id,
        email: response.data.email,
        firstName: response.data.first_name,
        lastName: response.data.last_name,
        totalSpent: response.data.total_spent || 0,
        orderCount: response.data.orders_count || 0,
        averageOrderValue: response.data.orders_count > 0 
          ? (response.data.total_spent || 0) / response.data.orders_count 
          : 0,
        firstOrderDate: response.data.created_at,
        lastOrderDate: response.data.updated_at,
        lifetimeValue: response.data.total_spent || 0,
        tags: response.data.tags || [],
      };

      return {
        data: customer,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching Triple Whale customer:', error);
      throw error;
    }
  }

  async getCustomerByEmail(email: string): Promise<ApiResponse<TripleWhaleCustomer | null>> {
    try {
      const response = await this.makeRequest<any>(`/customers?email=${encodeURIComponent(email)}`);
      
      const customerData = response.data?.data?.[0];
      if (!customerData) {
        return {
          data: null,
          success: true,
          timestamp: new Date().toISOString(),
        };
      }

      const customer: TripleWhaleCustomer = {
        id: customerData.id,
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        totalSpent: customerData.total_spent || 0,
        orderCount: customerData.orders_count || 0,
        averageOrderValue: customerData.orders_count > 0 
          ? (customerData.total_spent || 0) / customerData.orders_count 
          : 0,
        firstOrderDate: customerData.created_at,
        lastOrderDate: customerData.updated_at,
        lifetimeValue: customerData.total_spent || 0,
        tags: customerData.tags || [],
      };

      return {
        data: customer,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching Triple Whale customer by email:', error);
      throw error;
    }
  }

  async getRevenueAttribution(dateRange: DateRange): Promise<ApiResponse<any>> {
    try {
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];

      const response = await this.makeRequest<any>(
        `/analytics/attribution?start_date=${startDate}&end_date=${endDate}&group_by=source`
      );

      return response;
    } catch (error) {
      console.error('Error fetching Triple Whale attribution:', error);
      throw error;
    }
  }

  async getCohortAnalysis(dateRange: DateRange): Promise<ApiResponse<any>> {
    try {
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];

      const response = await this.makeRequest<any>(
        `/analytics/cohorts?start_date=${startDate}&end_date=${endDate}`
      );

      return response;
    } catch (error) {
      console.error('Error fetching Triple Whale cohort analysis:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/summary');
      return true;
    } catch (error) {
      console.error('Triple Whale connection test failed:', error);
      return false;
    }
  }

  async getProductPerformance(dateRange: DateRange): Promise<ApiResponse<any[]>> {
    try {
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];

      const response = await this.makeRequest<any>(
        `/analytics/products?start_date=${startDate}&end_date=${endDate}&sort_by=revenue&order=desc`
      );

      return response;
    } catch (error) {
      console.error('Error fetching Triple Whale product performance:', error);
      throw error;
    }
  }
}
