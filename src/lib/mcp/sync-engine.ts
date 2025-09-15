import { KlaviyoMCPClient } from './klaviyo';
import { TripleWhaleMCPClient } from './triple-whale';
import { 
  UnifiedCustomer, 
  DateRange, 
  RevenueAttribution, 
  CampaignAttribution,
  KlaviyoCampaign,
  TripleWhaleCustomer,
  TripleWhaleOrder,
  KlaviyoMetrics,
  TripleWhaleMetrics
} from '../types';

interface KlaviyoProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, unknown>;
}

export class DataSyncEngine {
  private klaviyoClient: KlaviyoMCPClient;
  private tripleWhaleClient: TripleWhaleMCPClient;

  constructor(klaviyoApiKey: string, tripleWhaleApiKey: string) {
    this.klaviyoClient = new KlaviyoMCPClient(klaviyoApiKey);
    this.tripleWhaleClient = new TripleWhaleMCPClient(tripleWhaleApiKey);
  }

  /**
   * Match customers between Klaviyo and Triple Whale platforms
   */
  async matchCustomers(dateRange?: DateRange): Promise<UnifiedCustomer[]> {
    try {
      console.log('Starting customer matching process...');

      // Fetch customers from both platforms
      const [klaviyoProfiles, tripleWhaleCustomers] = await Promise.all([
        this.getKlaviyoProfiles(),
        this.tripleWhaleClient.getCustomers(dateRange || { 
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
          to: new Date() 
        })
      ]);

      const unifiedCustomers: UnifiedCustomer[] = [];
      const processedEmails = new Set<string>();

      // Create a map of Triple Whale customers by email for efficient lookup
      const tripleWhaleMap = new Map<string, TripleWhaleCustomer>();
      tripleWhaleCustomers.data.forEach((customer: TripleWhaleCustomer) => {
        if (customer.email) {
          tripleWhaleMap.set(customer.email.toLowerCase(), customer);
        }
      });

      // Process Klaviyo profiles first
      for (const profile of klaviyoProfiles.data) {
        if (!profile.email || processedEmails.has(profile.email.toLowerCase())) {
          continue;
        }

        const email = profile.email.toLowerCase();
        processedEmails.add(email);

        const tripleWhaleCustomer = tripleWhaleMap.get(email);
        
        const unifiedCustomer: UnifiedCustomer = {
          email: profile.email,
          klaviyoId: profile.id,
          tripleWhaleId: tripleWhaleCustomer?.id,
          firstName: profile.firstName || tripleWhaleCustomer?.firstName,
          lastName: profile.lastName || tripleWhaleCustomer?.lastName,
          klaviyoSegments: (profile.attributes?.segments as string[]) || [],
          emailEngagement: {
            openRate: (profile.attributes?.engagement as Record<string, number>)?.open_rate || 0,
            clickRate: (profile.attributes?.engagement as Record<string, number>)?.click_rate || 0,
            lastEngaged: (profile.attributes?.last_event_date as string) || new Date().toISOString(),
          },
          totalSpent: tripleWhaleCustomer?.totalSpent || 0,
          orderCount: tripleWhaleCustomer?.ordersCount || 0,
          averageOrderValue: tripleWhaleCustomer?.averageOrderValue || 0,
          lifetimeValue: tripleWhaleCustomer?.totalSpent || 0,
        };

        // Calculate engagement and risk scores
        unifiedCustomer.engagementScore = this.calculateEngagementScore(unifiedCustomer);
        unifiedCustomer.riskScore = this.calculateRiskScore(unifiedCustomer);
        unifiedCustomer.predictedChurn = (unifiedCustomer.riskScore || 0) > 70;

        unifiedCustomers.push(unifiedCustomer);
      }

      // Process remaining Triple Whale customers
      for (const customer of tripleWhaleCustomers.data) {
        if (!customer.email || processedEmails.has(customer.email.toLowerCase())) {
          continue;
        }

        processedEmails.add(customer.email.toLowerCase());

        const unifiedCustomer: UnifiedCustomer = {
          email: customer.email,
          tripleWhaleId: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          totalSpent: customer.totalSpent,
          orderCount: customer.ordersCount,
          averageOrderValue: customer.averageOrderValue,
          lifetimeValue: customer.totalSpent,
          engagementScore: 0, // No email engagement data
          riskScore: this.calculateRiskScore({
            email: customer.email,
            totalSpent: customer.totalSpent,
            orderCount: customer.ordersCount,
            averageOrderValue: customer.averageOrderValue,
            lifetimeValue: customer.totalSpent,
          } as UnifiedCustomer),
        };

        unifiedCustomer.predictedChurn = (unifiedCustomer.riskScore || 0) > 70;
        unifiedCustomers.push(unifiedCustomer);
      }

      console.log(`Successfully matched ${unifiedCustomers.length} customers`);
      return unifiedCustomers;
    } catch (error) {
      console.error('Error matching customers:', error);
      throw error;
    }
  }

  /**
   * Calculate revenue attribution between email and other channels
   */
  async calculateRevenueAttribution(dateRange?: DateRange): Promise<RevenueAttribution> {
    try {
      // Fetch data from both platforms
      const [klaviyoMetrics, tripleWhaleMetrics, klaviyoCampaigns, tripleWhaleOrders] = await Promise.all([
        this.klaviyoClient.getMetrics(dateRange || { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() }),
        this.tripleWhaleClient.getMetrics(dateRange || { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() }),
        this.klaviyoClient.getCampaigns(dateRange || { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() }),
        this.tripleWhaleClient.getOrders(dateRange || { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() })
      ]);

      // Calculate basic attribution metrics
      const emailRevenue = klaviyoMetrics.data?.emailRevenue || 0;
      const totalRevenue = tripleWhaleMetrics.data?.totalRevenue || 0;
      const attributionRate = totalRevenue > 0 ? (emailRevenue / totalRevenue) * 100 : 0;

      // Calculate campaign attributions
      const campaignAttributions: CampaignAttribution[] = klaviyoCampaigns.data?.map((campaign: KlaviyoCampaign) => {
        // Find matching orders from Triple Whale
        const matchingOrders = tripleWhaleOrders.data?.filter((order: TripleWhaleOrder) => 
          order.source === 'klaviyo' && order.campaign === campaign.name
        ) || [];

        const campaignRevenue = matchingOrders.reduce((sum: number, order: TripleWhaleOrder) => 
          sum + (order.total || 0), 0);

        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          revenue: campaignRevenue,
          orders: matchingOrders.length,
          attributionType: 'direct' as const,
        };
      }) || [];

      // Calculate direct vs assisted attribution
      const directAttribution = campaignAttributions.reduce((sum, attr) => sum + attr.revenue, 0);
      const assistedAttribution = emailRevenue - directAttribution;

      return {
        emailRevenue,
        totalRevenue,
        attributionRate,
        directAttribution,
        assistedAttribution,
        campaigns: campaignAttributions,
      };
    } catch (error) {
      console.error('Error calculating revenue attribution:', error);
      throw error;
    }
  }

  /**
   * Sync all data from both platforms
   */
  async syncAllData(dateRange?: DateRange): Promise<{
    klaviyoMetrics: KlaviyoMetrics;
    tripleWhaleMetrics: TripleWhaleMetrics;
    unifiedCustomers: UnifiedCustomer[];
    revenueAttribution: RevenueAttribution;
  }> {
    try {
      // Fetch all data in parallel
      const [klaviyoMetrics, tripleWhaleMetrics, unifiedCustomers, revenueAttribution] = await Promise.all([
        this.klaviyoClient.getMetrics(dateRange || { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() }),
        this.tripleWhaleClient.getMetrics(dateRange || { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() }),
        this.matchCustomers(dateRange),
        this.calculateRevenueAttribution(dateRange)
      ]);

      return {
        klaviyoMetrics: klaviyoMetrics.data || {} as KlaviyoMetrics,
        tripleWhaleMetrics: tripleWhaleMetrics.data || {} as TripleWhaleMetrics,
        unifiedCustomers,
        revenueAttribution,
      };
    } catch (error) {
      console.error('Error syncing all data:', error);
      throw error;
    }
  }

  /**
   * Test connections to both platforms
   */
  async testConnections(): Promise<{ klaviyo: boolean; tripleWhale: boolean }> {
    try {
      const [klaviyoStatus, tripleWhaleStatus] = await Promise.all([
        this.klaviyoClient.testConnection(),
        this.tripleWhaleClient.testConnection()
      ]);

      return {
        klaviyo: klaviyoStatus,
        tripleWhale: tripleWhaleStatus,
      };
    } catch (error) {
      console.error('Error testing connections:', error);
      return {
        klaviyo: false,
        tripleWhale: false,
      };
    }
  }

  /**
   * Get Klaviyo profiles with enhanced data
   */
  private async getKlaviyoProfiles(): Promise<{ data: KlaviyoProfile[] }> {
    try {
      // This would typically fetch profiles from Klaviyo
      // For now, return mock data structure
      return { data: [] };
    } catch (error) {
      console.error('Error fetching Klaviyo profiles:', error);
      return { data: [] };
    }
  }

  /**
   * Calculate engagement score based on email and purchase behavior
   */
  private calculateEngagementScore(customer: UnifiedCustomer): number {
    let score = 0;

    // Email engagement (40% weight)
    if (customer.emailEngagement) {
      score += (customer.emailEngagement.openRate || 0) * 0.2;
      score += (customer.emailEngagement.clickRate || 0) * 0.2;
    }

    // Purchase behavior (60% weight)
    if (customer.orderCount && customer.orderCount > 0) {
      score += Math.min(customer.orderCount * 5, 30); // Max 30 points for orders
      score += Math.min((customer.averageOrderValue || 0) / 10, 30); // Max 30 points for AOV
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate risk score for customer churn prediction
   */
  private calculateRiskScore(customer: UnifiedCustomer): number {
    let risk = 0;

    // Low engagement increases risk
    if (customer.engagementScore !== undefined && customer.engagementScore < 20) {
      risk += 30;
    }

    // Low order frequency increases risk
    if (customer.orderCount !== undefined && customer.orderCount < 2) {
      risk += 25;
    }

    // Low total spent increases risk
    if (customer.totalSpent !== undefined && customer.totalSpent < 100) {
      risk += 20;
    }

    // Recent engagement reduces risk
    if (customer.emailEngagement?.lastEngaged) {
      const daysSinceEngagement = Math.floor(
        (Date.now() - new Date(customer.emailEngagement.lastEngaged).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceEngagement > 30) {
        risk += 25;
      }
    }

    return Math.min(Math.round(risk), 100);
  }
}
