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

  async getMetrics(dateRange: DateRange): Promise<ApiResponse<TripleWhaleMetrics>> {
    try {
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];

      // Fetch multiple metrics in parallel
      const [
        ordersResponse,
        customersResponse,
        revenueResponse
      ] = await Promise.all([
        this.makeRequest(`/orders?start_date=${startDate}&end_date=${endDate}`),
        this.makeRequest(`/customers?start_date=${startDate}&end_date=${endDate}`),
        this.makeRequest(`/analytics/revenue?start_date=${startDate}&end_date=${endDate}`)
      ]);

      const orders = ordersResponse.data?.data || [];
      const customers = customersResponse.data?.data || [];
      const revenueData = revenueResponse.data?.data || {};

      // Calculate metrics
      const totalRevenue = orders.reduce((sum: number, order: any) => {
        return sum + (order.total_price || 0);
      }, 0);

      const uniqueCustomers = new Set(orders.map((order: any) => order.customer_id)).size;
      const returningCustomers = customers.filter((customer: any) => customer.order_count > 1).length;
      const newCustomers = customers.filter((customer: any) => customer.order_count === 1).length;

      const metrics: TripleWhaleMetrics = {
        totalRevenue,
        orders: orders.length,
        customers: uniqueCustomers,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        customerLifetimeValue: customers.reduce((sum: number, customer: any) => {
          return sum + (customer.total_spent || 0);
        }, 0) / customers.length || 0,
        returnCustomerRate: customers.length > 0 ? (returningCustomers / customers.length) * 100 : 0,
        newCustomerRate: customers.length > 0 ? (newCustomers / customers.length) * 100 : 0,
      };

      return {
        data: metrics,
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
        `/orders?start_date=${startDate}&end_date=${endDate}&include=line_items`
      );

      const orders: TripleWhaleOrder[] = response.data?.data?.map((order: any) => ({
        id: order.id,
        customerId: order.customer_id,
        email: order.email,
        total: order.total_price || 0,
        currency: order.currency || 'USD',
        createdAt: order.created_at,
        status: order.financial_status || 'pending',
        items: order.line_items?.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          name: item.name || item.title,
          quantity: item.quantity || 1,
          price: item.price || 0,
          total: (item.price || 0) * (item.quantity || 1),
        })) || [],
        source: order.source_name,
        campaign: order.utm_campaign,
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

  async getCustomers(dateRange?: DateRange): Promise<ApiResponse<TripleWhaleCustomer[]>> {
    try {
      let url = '/customers';
      if (dateRange) {
        const startDate = dateRange.from.toISOString().split('T')[0];
        const endDate = dateRange.to.toISOString().split('T')[0];
        url += `?start_date=${startDate}&end_date=${endDate}`;
      }

      const response = await this.makeRequest<any>(url);

      const customers: TripleWhaleCustomer[] = response.data?.data?.map((customer: any) => ({
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        totalSpent: customer.total_spent || 0,
        orderCount: customer.orders_count || 0,
        averageOrderValue: customer.orders_count > 0 
          ? (customer.total_spent || 0) / customer.orders_count 
          : 0,
        firstOrderDate: customer.created_at,
        lastOrderDate: customer.updated_at,
        lifetimeValue: customer.total_spent || 0,
        tags: customer.tags || [],
      })) || [];

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
      await this.makeRequest('/account');
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
