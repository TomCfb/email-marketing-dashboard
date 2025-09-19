"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ComparisonChart } from '@/components/charts/comparison-chart';
import { DataTable } from '@/components/shared/data-table';
import { CampaignDetailModal } from '@/components/campaigns/campaign-detail-modal';
import { useDateRange } from '@/lib/store/dashboard-store';
import { QueryKeys, KlaviyoCampaign } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function OverviewPage() {
  const dateRange = useDateRange();
  const [selectedCampaign, setSelectedCampaign] = useState<KlaviyoCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metricsTimeframe, setMetricsTimeframe] = useState<'last_30_days' | 'last_90_days' | 'last_12_months'>('last_90_days');

  const metricsFromTo = useMemo(() => {
    const now = new Date();
    const days = metricsTimeframe === 'last_30_days' ? 30 : metricsTimeframe === 'last_90_days' ? 90 : 365;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const to = now;
    return { from, to };
  }, [metricsTimeframe]);

  // Campaign quick filters
  const [minOpens, setMinOpens] = useState<number>(0);
  const [minClicks, setMinClicks] = useState<number>(0);
  const [minOpenRate, setMinOpenRate] = useState<number>(0); // percent
  const [minClickRate, setMinClickRate] = useState<number>(0); // percent

  // Fetch Klaviyo metrics
  const { 
    data: klaviyoResponse, 
    isLoading: klaviyoLoading, 
    error: klaviyoError 
  } = useQuery({
    queryKey: [...QueryKeys.klaviyoMetrics(metricsFromTo), metricsTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/klaviyo/metrics?from=${metricsFromTo.from.toISOString()}&to=${metricsFromTo.to.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch Klaviyo metrics');
      return response.json();
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch Triple Whale metrics
  const { 
    data: tripleWhaleResponse, 
    isLoading: tripleWhaleLoading, 
    error: tripleWhaleError 
  } = useQuery({
    queryKey: [...QueryKeys.tripleWhaleMetrics(metricsFromTo), metricsTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/triple-whale/metrics?from=${metricsFromTo.from.toISOString()}&to=${metricsFromTo.to.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch Triple Whale metrics');
      return response.json();
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch campaigns for the table
  const { 
    data: campaignsResponse, 
    isLoading: campaignsLoading 
  } = useQuery({
    queryKey: QueryKeys.klaviyoCampaigns(dateRange),
    queryFn: async () => {
      const response = await fetch(`/api/klaviyo/campaigns?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Extract data from API responses
  const klaviyoMetrics = klaviyoResponse?.data;
  const tripleWhaleMetrics = tripleWhaleResponse?.data;
  const campaigns = campaignsResponse?.data;

  const isLoading = klaviyoLoading || tripleWhaleLoading;
  const hasKlaviyoData = klaviyoMetrics && !klaviyoError;
  const hasTripleWhaleData = tripleWhaleMetrics && !tripleWhaleError;
  
  // Only show error if both APIs fail
  const hasCriticalError = klaviyoError && tripleWhaleError;

  const handleCampaignClick = (campaign: KlaviyoCampaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  if (hasCriticalError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please check your API connections and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show warnings for individual API failures
  const showWarnings = klaviyoError || tripleWhaleError;

  return (
    <div className="space-y-6">
      {/* API Status Warnings */}
      {showWarnings && (
        <div className="space-y-2">
          {klaviyoError && (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Klaviyo API unavailable. Showing partial data from available sources.
              </AlertDescription>
            </Alert>
          )}
          {tripleWhaleError && (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Triple Whale API unavailable. Initialize MCP server with: npx @triplewhale/mcp-server-triplewhale init $TRIPLE_WHALE_API_KEY
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview Dashboard</h1>
          <p className="text-muted-foreground">
            Cross-platform analytics comparing Klaviyo and Triple Whale performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">KPI Timeframe</span>
          <select
            aria-label="KPI timeframe"
            className="border rounded-md text-sm px-2 py-1"
            value={metricsTimeframe}
            onChange={(e) => setMetricsTimeframe(e.target.value as typeof metricsTimeframe)}
          >
            <option value="last_30_days">Last 30 days</option>
            <option value="last_90_days">Last 90 days</option>
            <option value="last_12_months">Last 12 months</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={tripleWhaleMetrics?.totalRevenue ? `$${(tripleWhaleMetrics.totalRevenue / 1000).toFixed(1)}k` : '$0'}
          change={12.5}
          changeType="increase"
          loading={isLoading}
        />
        <MetricCard
          title="Email Revenue"
          value={klaviyoMetrics?.emailRevenue ? `$${(klaviyoMetrics.emailRevenue / 1000).toFixed(1)}k` : '$0'}
          change={8.2}
          changeType="increase"
          loading={isLoading}
        />
        <MetricCard
          title="Email Attribution"
          value={klaviyoMetrics?.emailRevenue && tripleWhaleMetrics?.totalRevenue 
            ? `${((klaviyoMetrics.emailRevenue / tripleWhaleMetrics.totalRevenue) * 100).toFixed(1)}%`
            : '0%'
          }
          change={2.1}
          changeType="increase"
          loading={isLoading}
        />
        <MetricCard
          title="Conversion Rate"
          value={klaviyoMetrics?.conversionRate ? `${klaviyoMetrics.conversionRate.toFixed(2)}%` : '0%'}
          change={-0.5}
          changeType="decrease"
          loading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Revenue Comparison</h3>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ComparisonChart
              data={{
                klaviyo: [
                  { date: metricsFromTo.from.toISOString(), value: klaviyoMetrics?.emailRevenue || 0, label: 'Email Revenue' }
                ],
                tripleWhale: [
                  { date: metricsFromTo.from.toISOString(), value: tripleWhaleMetrics?.totalRevenue || 0, label: 'Total Revenue' }
                ]
              }}
              title="Revenue Attribution"
            />
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Performance Metrics</h3>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Open Rate</div>
                <div className="text-2xl font-bold">{klaviyoMetrics?.openRate?.toFixed(2) || '0'}%</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Click Rate</div>
                <div className="text-2xl font-bold">{klaviyoMetrics?.clickRate?.toFixed(2) || '0'}%</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Average Order Value</div>
                <div className="text-2xl font-bold">${tripleWhaleMetrics?.averageOrderValue?.toFixed(2) || '0'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">Recent Campaign Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Min Opens</span>
              <input
                type="number"
                min={0}
                className="border rounded-md text-sm px-2 py-1 w-24"
                value={minOpens}
                onChange={(e) => setMinOpens(Number(e.target.value) || 0)}
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Min Clicks</span>
              <input
                type="number"
                min={0}
                className="border rounded-md text-sm px-2 py-1 w-24"
                value={minClicks}
                onChange={(e) => setMinClicks(Number(e.target.value) || 0)}
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Min Open %</span>
              <input
                type="number"
                min={0}
                max={100}
                className="border rounded-md text-sm px-2 py-1 w-24"
                value={minOpenRate}
                onChange={(e) => setMinOpenRate(Number(e.target.value) || 0)}
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Min Click %</span>
              <input
                type="number"
                min={0}
                max={100}
                className="border rounded-md text-sm px-2 py-1 w-24"
                value={minClickRate}
                onChange={(e) => setMinClickRate(Number(e.target.value) || 0)}
              />
            </label>
          </div>
        </div>
        {campaignsLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <DataTable
            data={(campaigns || [])
              .filter((c: KlaviyoCampaign) => c.status === 'sent')
              .filter((c: KlaviyoCampaign) => new Date(c.sentAt) >= metricsFromTo.from)
              .filter((c: KlaviyoCampaign) => c.opens >= minOpens)
              .filter((c: KlaviyoCampaign) => c.clicks >= minClicks)
              .filter((c: KlaviyoCampaign) => c.openRate >= minOpenRate)
              .filter((c: KlaviyoCampaign) => c.clickRate >= minClickRate)
            }
            columns={[
              {
                key: 'name',
                header: 'Campaign Name',
                sortable: true,
              },
              {
                key: 'sentAt',
                header: 'Sent Date',
                sortable: true,
                render: (value: string) => new Date(value).toLocaleDateString(),
              },
              {
                key: 'recipients',
                header: 'Recipients',
                sortable: true,
                render: (value: number) => value.toLocaleString(),
              },
              {
                key: 'openRate',
                header: 'Open Rate',
                sortable: true,
                render: (value: number) => `${value.toFixed(2)}%`,
              },
              {
                key: 'clickRate',
                header: 'Click Rate',
                sortable: true,
                render: (value: number) => `${value.toFixed(2)}%`,
              },
              {
                key: 'revenue',
                header: 'Revenue',
                sortable: true,
                render: (value: number) => `$${value.toFixed(2)}`,
              },
            ]}
            onRowClick={handleCampaignClick}
          />
        )}
      </div>

      {/* Campaign Detail Modal */}
      <CampaignDetailModal
        campaign={selectedCampaign}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
