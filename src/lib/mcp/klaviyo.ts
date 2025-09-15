import { KlaviyoMetrics, KlaviyoCampaign, KlaviyoFlow, KlaviyoSegment, ApiResponse, DateRange } from '../types';

export class KlaviyoMCPClient {
  private apiKey: string;
  private endpoint: string;
  private baseUrl: string;

  constructor(apiKey: string, endpoint?: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint || 'https://a.klaviyo.com/api';
    this.baseUrl = 'https://a.klaviyo.com/api';
  }

  private async makeRequest<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Klaviyo-API-Key ${this.apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Klaviyo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      data,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async getMetrics(dateRange: DateRange): Promise<ApiResponse<KlaviyoMetrics>> {
    try {
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];

      // Fetch multiple metrics in parallel
      const [
        campaignMetrics,
        flowMetrics,
        profileMetrics,
        revenueMetrics
      ] = await Promise.all([
        this.makeRequest(`/campaigns?filter=greater-than(send_time,${startDate})&filter=less-than(send_time,${endDate})`),
        this.makeRequest(`/flows`),
        this.makeRequest(`/profiles?filter=greater-than(created,${startDate})`),
        this.makeRequest(`/events?filter=equals(metric_name,"Placed Order")&filter=greater-than(datetime,${startDate})`)
      ]);

      // Process and aggregate the data
      const campaigns = campaignMetrics.data?.data || [];
      const flows = flowMetrics.data?.data || [];
      const profiles = profileMetrics.data?.data || [];
      const orders = revenueMetrics.data?.data || [];

      // Calculate aggregated metrics
      const totalRevenue = orders.reduce((sum: number, order: any) => {
        return sum + (order.properties?.value || 0);
      }, 0);

      const emailRevenue = orders.filter((order: any) => 
        order.properties?.source === 'email'
      ).reduce((sum: number, order: any) => {
        return sum + (order.properties?.value || 0);
      }, 0);

      const totalOpens = campaigns.reduce((sum: number, campaign: any) => {
        return sum + (campaign.statistics?.open_count || 0);
      }, 0);

      const totalSent = campaigns.reduce((sum: number, campaign: any) => {
        return sum + (campaign.statistics?.sent_count || 0);
      }, 0);

      const totalClicks = campaigns.reduce((sum: number, campaign: any) => {
        return sum + (campaign.statistics?.click_count || 0);
      }, 0);

      const metrics: KlaviyoMetrics = {
        totalRevenue,
        emailRevenue,
        campaigns: campaigns.length,
        flows: flows.length,
        subscribers: profiles.length,
        openRate: totalSent > 0 ? (totalOpens / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicks / totalSent) * 100 : 0,
        conversionRate: totalSent > 0 ? (orders.length / totalSent) * 100 : 0,
        unsubscribeRate: 0, // Calculate from unsubscribe events
      };

      return {
        data: metrics,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching Klaviyo metrics:', error);
      throw error;
    }
  }

  async getCampaigns(dateRange: DateRange): Promise<ApiResponse<KlaviyoCampaign[]>> {
    try {
      const startDate = dateRange.from.toISOString().split('T')[0];
      const endDate = dateRange.to.toISOString().split('T')[0];

      const response = await this.makeRequest<any>(
        `/campaigns?filter=greater-than(send_time,${startDate})&filter=less-than(send_time,${endDate})&include=campaign-messages`
      );

      const campaigns: KlaviyoCampaign[] = response.data?.data?.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.attributes?.name || 'Untitled Campaign',
        subject: campaign.relationships?.['campaign-messages']?.data?.[0]?.attributes?.subject || '',
        status: campaign.attributes?.status || 'draft',
        sentAt: campaign.attributes?.send_time,
        recipients: campaign.statistics?.sent_count || 0,
        opens: campaign.statistics?.open_count || 0,
        clicks: campaign.statistics?.click_count || 0,
        revenue: campaign.statistics?.revenue || 0,
        openRate: campaign.statistics?.sent_count > 0 
          ? (campaign.statistics?.open_count / campaign.statistics?.sent_count) * 100 
          : 0,
        clickRate: campaign.statistics?.sent_count > 0 
          ? (campaign.statistics?.click_count / campaign.statistics?.sent_count) * 100 
          : 0,
        conversionRate: campaign.statistics?.sent_count > 0 
          ? (campaign.statistics?.order_count / campaign.statistics?.sent_count) * 100 
          : 0,
      })) || [];

      return {
        data: campaigns,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching Klaviyo campaigns:', error);
      throw error;
    }
  }

  async getFlows(): Promise<ApiResponse<KlaviyoFlow[]>> {
    try {
      const response = await this.makeRequest<any>('/flows?include=flow-actions');

      const flows: KlaviyoFlow[] = response.data?.data?.map((flow: any) => ({
        id: flow.id,
        name: flow.attributes?.name || 'Untitled Flow',
        status: flow.attributes?.status || 'draft',
        emails: flow.relationships?.['flow-actions']?.data?.length || 0,
        revenue: flow.statistics?.revenue || 0,
        conversionRate: flow.statistics?.conversion_rate || 0,
        subscribers: flow.statistics?.subscriber_count || 0,
      })) || [];

      return {
        data: flows,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching Klaviyo flows:', error);
      throw error;
    }
  }

  async getSegments(): Promise<ApiResponse<KlaviyoSegment[]>> {
    try {
      const response = await this.makeRequest<any>('/segments');

      const segments: KlaviyoSegment[] = response.data?.data?.map((segment: any) => ({
        id: segment.id,
        name: segment.attributes?.name || 'Untitled Segment',
        count: segment.attributes?.profile_count || 0,
        estimatedCount: segment.attributes?.estimated_count || 0,
        isProcessing: segment.attributes?.is_processing || false,
      })) || [];

      return {
        data: segments,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching Klaviyo segments:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/accounts');
      return true;
    } catch (error) {
      console.error('Klaviyo connection test failed:', error);
      return false;
    }
  }

  async getProfile(email: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeRequest<any>(
        `/profiles?filter=equals(email,"${email}")`
      );
      
      return response;
    } catch (error) {
      console.error('Error fetching Klaviyo profile:', error);
      throw error;
    }
  }

  async getEvents(profileId: string, dateRange: DateRange): Promise<ApiResponse<any[]>> {
    try {
      const startDate = dateRange.from.toISOString();
      const endDate = dateRange.to.toISOString();

      const response = await this.makeRequest<any>(
        `/events?filter=equals(profile_id,"${profileId}")&filter=greater-than(datetime,${startDate})&filter=less-than(datetime,${endDate})`
      );

      return response;
    } catch (error) {
      console.error('Error fetching Klaviyo events:', error);
      throw error;
    }
  }
}
