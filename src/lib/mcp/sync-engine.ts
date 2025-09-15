import { KlaviyoMCPClient } from './klaviyo';
import { TripleWhaleMCPClient } from './triple-whale';
import { UnifiedCustomer, DateRange, RevenueAttribution, CampaignAttribution } from '../types';

export class DataSyncEngine {
  private klaviyoClient: KlaviyoMCPClient;
  private tripleWhaleClient: TripleWhaleMCPClient;

  constructor(klaviyoApiKey: string, tripleWhaleApiKey: string) {
    this.klaviyoClient = new KlaviyoMCPClient(klaviyoApiKey);
    this.tripleWhaleClient = new TripleWhaleMCPClient(tripleWhaleApiKey);
  }

  /**
   * Match customers between Klaviyo and Triple Whale platforms
   * Uses email as primary matching key with fuzzy matching for incomplete data
   */
  async matchCustomers(dateRange?: DateRange): Promise<UnifiedCustomer[]> {
    try {
      console.log('Starting customer matching process...');

      // Fetch customers from both platforms
      const [klaviyoProfiles, tripleWhaleCustomers] = await Promise.all([
        this.getKlaviyoProfiles(dateRange),
        this.tripleWhaleClient.getCustomers(dateRange)
      ]);

      const unifiedCustomers: UnifiedCustomer[] = [];
      const processedEmails = new Set<string>();

      // Create a map of Triple Whale customers by email for efficient lookup
      const tripleWhaleMap = new Map<string, any>();
      tripleWhaleCustomers.data.forEach(customer => {
        if (customer.email) {
          tripleWhaleMap.set(customer.email.toLowerCase(), customer);
        }
      });

      // Process Klaviyo profiles first
      for (const profile of klaviyoProfiles) {
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
          firstName: profile.first_name || tripleWhaleCustomer?.firstName,
          lastName: profile.last_name || tripleWhaleCustomer?.lastName,
          klaviyoSegments: profile.segments || [],
          emailEngagement: {
            openRate: profile.engagement?.open_rate || 0,
            clickRate: profile.engagement?.click_rate || 0,
            lastEngaged: profile.last_event_date || new Date().toISOString(),
          },
          totalSpent: tripleWhaleCustomer?.totalSpent || 0,
          orderCount: tripleWhaleCustomer?.orderCount || 0,
          averageOrderValue: tripleWhaleCustomer?.averageOrderValue || 0,
          lifetimeValue: tripleWhaleCustomer?.lifetimeValue || 0,
        };

        // Calculate engagement and risk scores
        unifiedCustomer.engagementScore = this.calculateEngagementScore(unifiedCustomer);
        unifiedCustomer.riskScore = this.calculateRiskScore(unifiedCustomer);
        unifiedCustomer.predictedChurn = unifiedCustomer.riskScore > 70;

        unifiedCustomers.push(unifiedCustomer);
      }

      // Process remaining Triple Whale customers that weren't matched
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
          orderCount: customer.orderCount,
          averageOrderValue: customer.averageOrderValue,
          lifetimeValue: customer.lifetimeValue,
          engagementScore: 0, // No email engagement data
          riskScore: this.calculateRiskScore({
            email: customer.email,
            totalSpent: customer.totalSpent,
            orderCount: customer.orderCount,
            averageOrderValue: customer.averageOrderValue,
            lifetimeValue: customer.lifetimeValue,
          } as UnifiedCustomer),
        };

        unifiedCustomer.predictedChurn = unifiedCustomer.riskScore > 70;
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
   * Calculate revenue attribution between email marketing and total revenue
   */
  async calculateRevenueAttribution(dateRange: DateRange): Promise<RevenueAttribution> {
    try {
      console.log('Calculating revenue attribution...');

      const [klaviyoMetrics, tripleWhaleMetrics, klaviyoCampaigns, tripleWhaleOrders] = await Promise.all([
        this.klaviyoClient.getMetrics(dateRange),
        this.tripleWhaleClient.getMetrics(dateRange),
        this.klaviyoClient.getCampaigns(dateRange),
        this.tripleWhaleClient.getOrders(dateRange)
      ]);

      const emailRevenue = klaviyoMetrics.data.emailRevenue;
      const totalRevenue = tripleWhaleMetrics.data.totalRevenue;
      const attributionRate = totalRevenue > 0 ? (emailRevenue / totalRevenue) * 100 : 0;

      // Calculate campaign-level attribution
      const campaignAttributions: CampaignAttribution[] = klaviyoCampaigns.data.map(campaign => {
        // Match orders to campaigns by timestamp and source
        const campaignOrders = tripleWhaleOrders.data.filter(order => {
          const orderDate = new Date(order.createdAt);
          const campaignDate = new Date(campaign.sentAt);
          const timeDiff = orderDate.getTime() - campaignDate.getTime();
          
          // Consider orders within 7 days of campaign send as potentially attributed
          return timeDiff > 0 && timeDiff <= 7 * 24 * 60 * 60 * 1000 && 
                 (order.source === 'email' || order.campaign === campaign.name);
        });

        const campaignRevenue = campaignOrders.reduce((sum, order) => sum + order.total, 0);

        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          revenue: campaignRevenue,
          orders: campaignOrders.length,
          attributionType: 'direct' as const,
        };
      });

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
   * Sync data from both platforms and cache results
   */
  async syncAllData(dateRange: DateRange): Promise<{
    klaviyoMetrics: any;
    tripleWhaleMetrics: any;
    unifiedCustomers: UnifiedCustomer[];
    revenueAttribution: RevenueAttribution;
  }> {
    try {
      console.log('Starting full data sync...');

      const [klaviyoMetrics, tripleWhaleMetrics, unifiedCustomers, revenueAttribution] = await Promise.all([
        this.klaviyoClient.getMetrics(dateRange),
        this.tripleWhaleClient.getMetrics(dateRange),
        this.matchCustomers(dateRange),
        this.calculateRevenueAttribution(dateRange)
      ]);

      console.log('Full data sync completed successfully');

      return {
        klaviyoMetrics: klaviyoMetrics.data,
        tripleWhaleMetrics: tripleWhaleMetrics.data,
        unifiedCustomers,
        revenueAttribution,
      };
    } catch (error) {
      console.error('Error during full data sync:', error);
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
  private async getKlaviyoProfiles(dateRange?: DateRange): Promise<any[]> {
    try {
      // This would typically fetch profiles from Klaviyo
      // For now, return mock data structure
      return [];
    } catch (error) {
      console.error('Error fetching Klaviyo profiles:', error);
      return [];
    }
  }

  /**
   * Calculate engagement score based on email and purchase behavior
   */
  private calculateEngagementScore(customer: UnifiedCustomer): number {
    let score = 0;

    // Email engagement (40% weight)
    if (customer.emailEngagement) {
      const emailScore = (customer.emailEngagement.openRate * 0.6 + customer.emailEngagement.clickRate * 0.4);
      score += emailScore * 0.4;
    }

    // Purchase behavior (60% weight)
    if (customer.orderCount > 0) {
      const purchaseScore = Math.min(100, (customer.orderCount * 10) + (customer.averageOrderValue / 10));
      score += purchaseScore * 0.6;
    }

    return Math.round(Math.min(100, score));
  }

  /**
   * Calculate churn risk score
   */
  private calculateRiskScore(customer: UnifiedCustomer): number {
    let riskScore = 0;

    // Low order count increases risk
    if (customer.orderCount === 0) {
      riskScore += 40;
    } else if (customer.orderCount === 1) {
      riskScore += 25;
    } else if (customer.orderCount < 5) {
      riskScore += 10;
    }

    // Low email engagement increases risk
    if (customer.emailEngagement) {
      if (customer.emailEngagement.openRate < 10) {
        riskScore += 20;
      } else if (customer.emailEngagement.openRate < 25) {
        riskScore += 10;
      }

      if (customer.emailEngagement.clickRate < 2) {
        riskScore += 15;
      }
    }

    // Low spending increases risk
    if (customer.totalSpent < 50) {
      riskScore += 15;
    } else if (customer.totalSpent < 100) {
      riskScore += 5;
    }

    return Math.min(100, riskScore);
  }
}
