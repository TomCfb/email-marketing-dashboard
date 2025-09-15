import { KlaviyoMetrics, KlaviyoCampaign, KlaviyoFlow, KlaviyoSegment, ApiResponse, DateRange, KlaviyoApiProfile, KlaviyoApiCampaign, KlaviyoApiFlow, KlaviyoApiSegment } from '../types';

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
      // Get profile count
      const profilesResponse = await this.makeRequest<{data: KlaviyoApiProfile[]}>('/profiles');
      const subscriberCount = profilesResponse.data?.data?.length || 0;

      // Get campaigns for metrics calculation
      const campaignsResponse = await this.makeRequest<{data: KlaviyoApiCampaign[]}>('/campaigns');
      const campaigns = campaignsResponse.data?.data || [];

      // Get flows for flow count
      const flowsResponse = await this.makeRequest<{data: KlaviyoApiFlow[]}>('/flows');
      const flowCount = flowsResponse.data?.data?.length || 0;

      // Calculate metrics from real data
      let totalRevenue = 0;
      let emailRevenue = 0;
      let totalOpens = 0;
      let totalClicks = 0;
      let totalSent = 0;
      let totalUnsubscribes = 0;

      for (const campaign of campaigns) {
        const stats = campaign.attributes?.statistics || {};
        totalRevenue += stats.revenue || 0;
        emailRevenue += stats.revenue || 0;
        totalOpens += stats.unique_opens || 0;
        totalClicks += stats.unique_clicks || 0;
        totalSent += stats.recipients || 0;
        totalUnsubscribes += stats.unsubscribes || 0;
      }

      const openRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;
      const conversionRate = totalSent > 0 ? (totalRevenue / totalSent) * 100 : 0;
      const unsubscribeRate = totalSent > 0 ? (totalUnsubscribes / totalSent) * 100 : 0;

      const metrics: KlaviyoMetrics = {
        totalRevenue,
        emailRevenue,
        campaigns: campaigns.length,
        flows: flowCount,
        subscribers: subscriberCount,
        openRate,
        clickRate,
        conversionRate,
        unsubscribeRate,
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
      const response = await this.makeRequest<{data: KlaviyoApiCampaign[]}>('/campaigns?include=campaign-messages');
      
      const campaigns: KlaviyoCampaign[] = response.data?.data?.map((campaign: KlaviyoApiCampaign) => {
        const attributes = campaign.attributes || {};
        const stats = attributes.statistics || {};
        
        return {
          id: campaign.id,
          name: attributes.name || 'Untitled Campaign',
          subject: attributes.subject_line || 'No Subject',
          status: (attributes.status as 'draft' | 'sent' | 'scheduled' | 'cancelled') || 'draft',
          sentAt: attributes.send_time || new Date().toISOString(),
          recipients: stats.recipients || 0,
          opens: stats.unique_opens || 0,
          clicks: stats.unique_clicks || 0,
          revenue: stats.revenue || 0,
          openRate: (stats.recipients || 0) > 0 ? ((stats.unique_opens || 0) / (stats.recipients || 1)) * 100 : 0,
          clickRate: (stats.recipients || 0) > 0 ? ((stats.unique_clicks || 0) / (stats.recipients || 1)) * 100 : 0,
          conversionRate: (stats.recipients || 0) > 0 ? ((stats.revenue || 0) / (stats.recipients || 1)) * 100 : 0,
        };
      }) || [];

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
      const response = await this.makeRequest<{data: KlaviyoApiFlow[]}>('/flows?include=flow-actions');

      const flows: KlaviyoFlow[] = response.data?.data?.map((flow: KlaviyoApiFlow) => ({
        id: flow.id,
        name: flow.attributes?.name || 'Untitled Flow',
        status: (flow.attributes?.status as 'active' | 'paused' | 'draft') || 'draft',
        emails: flow.relationships?.['flow-actions']?.data?.length || 0,
        revenue: flow.attributes?.statistics?.revenue || 0,
        conversionRate: flow.attributes?.statistics?.conversion_rate || 0,
        subscribers: flow.attributes?.statistics?.subscriber_count || 0,
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
      const response = await this.makeRequest<{data: KlaviyoApiSegment[]}>('/segments');

      const segments: KlaviyoSegment[] = response.data?.data?.map((segment: KlaviyoApiSegment) => ({
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
