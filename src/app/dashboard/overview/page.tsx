"use client";

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ComparisonChart } from '@/components/charts/comparison-chart';
import { DataTable } from '@/components/shared/data-table';
import { CampaignDetailModal } from '@/components/campaigns/campaign-detail-modal';
import { useDateRange } from '@/lib/store/dashboard-store';
import { QueryKeys, KlaviyoCampaign } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function OverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const dateRange = useDateRange();
  const [selectedCampaign, setSelectedCampaign] = useState<KlaviyoCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metricsTimeframe, setMetricsTimeframe] = useState<'last_30_days' | 'last_90_days' | 'last_12_months'>('last_90_days');
  const [refreshAck, setRefreshAck] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

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
      const url = `/api/klaviyo/metrics?from=${metricsFromTo.from.toISOString()}&to=${metricsFromTo.to.toISOString()}&ts=${Date.now()}`;
      const response = await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-store' } });
      if (!response.ok) throw new Error('Failed to fetch Klaviyo metrics');
      const json = await response.json();
      if (!json?.meta || json.meta.liveSource !== 'klaviyo') {
        throw new Error('Live source verification failed for Klaviyo metrics');
      }
      return json;
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Health polling (60s) - verifies live status without placeholders
  const { data: health, refetch: refetchHealth } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const url = `/api/health?ts=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-store' } });
      if (!res.ok) throw new Error('Health check failed');
      return res.json();
    },
    refetchInterval: 60000,
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
      const url = `/api/triple-whale/metrics?from=${metricsFromTo.from.toISOString()}&to=${metricsFromTo.to.toISOString()}&ts=${Date.now()}`;
      const response = await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-store' } });
      if (!response.ok) throw new Error('Failed to fetch Triple Whale metrics');
      const json = await response.json();
      if (!json?.meta || json.meta.liveSource !== 'triple_whale') {
        throw new Error('Live source verification failed for Triple Whale metrics');
      }
      return json;
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
      const url = `/api/klaviyo/campaigns?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}&ts=${Date.now()}`;
      const response = await fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-store' } });
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const json = await response.json();
      if (!json?.meta || json.meta.liveSource !== 'klaviyo') {
        throw new Error('Live source verification failed for Klaviyo campaigns');
      }
      return json;
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Extract data from API responses
  const klaviyoMetrics = klaviyoResponse?.data;
  const tripleWhaleMetrics = tripleWhaleResponse?.data;
  const campaigns = campaignsResponse?.data;

  const isLoading = klaviyoLoading || tripleWhaleLoading;
  const klaviyoLive = health?.klaviyo?.live ?? (!!klaviyoResponse?.meta?.liveSource && klaviyoResponse.meta.liveSource === 'klaviyo');
  const tripleWhaleLive = health?.tripleWhale?.live ?? (!!tripleWhaleResponse?.meta?.liveSource && tripleWhaleResponse.meta.liveSource === 'triple_whale');
  const campaignsLive = health?.campaigns?.live ?? (!!campaignsResponse?.meta?.liveSource && campaignsResponse.meta.liveSource === 'klaviyo');
  const klaviyoFetchedAt = health?.klaviyo?.fetchedAt ?? klaviyoResponse?.meta?.fetchedAt;
  const tripleWhaleFetchedAt = health?.tripleWhale?.fetchedAt ?? tripleWhaleResponse?.meta?.fetchedAt;
  const campaignsFetchedAt = health?.campaigns?.fetchedAt ?? campaignsResponse?.meta?.fetchedAt;
  const latestFetchedAt = useMemo(() => {
    const times = [klaviyoFetchedAt, tripleWhaleFetchedAt, campaignsFetchedAt]
      .filter(Boolean)
      .map((t) => new Date(t as string).getTime());
    if (times.length === 0) return null;
    return new Date(Math.max(...times)).toLocaleTimeString();
  }, [klaviyoFetchedAt, tripleWhaleFetchedAt, campaignsFetchedAt]);
  
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
      {/* Live Health Panel */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground">Live Health</span>
        <span className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded border ${klaviyoLive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          <span className={`h-2 w-2 rounded-full ${klaviyoLive ? 'bg-green-500' : 'bg-red-500'}`} />
          Klaviyo {klaviyoLive ? 'Live' : 'Down'}{klaviyoFetchedAt ? ` • ${new Date(klaviyoFetchedAt).toLocaleTimeString()}` : ''}
        </span>
        <span className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded border ${tripleWhaleLive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          <span className={`h-2 w-2 rounded-full ${tripleWhaleLive ? 'bg-green-500' : 'bg-red-500'}`} />
          Triple Whale {tripleWhaleLive ? 'Live' : 'Down'}{tripleWhaleFetchedAt ? ` • ${new Date(tripleWhaleFetchedAt).toLocaleTimeString()}` : ''}
        </span>
        <span className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded border ${campaignsLive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
          <span className={`h-2 w-2 rounded-full ${campaignsLive ? 'bg-green-500' : 'bg-yellow-500'}`} />
          Campaigns {campaignsLive ? 'Live' : 'Pending'}{campaignsFetchedAt ? ` • ${new Date(campaignsFetchedAt).toLocaleTimeString()}` : ''}
        </span>
      </div>
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
          <div className="text-xs text-muted-foreground">
            <a
              href="https://github.com/TomCfb/email-marketing-dashboard#-debugging--testing"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              View logs & debugging guidance
            </a>
          </div>
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
          {latestFetchedAt && (
            <span className="text-xs text-muted-foreground">Last updated {latestFetchedAt}</span>
          )}
          <button
            type="button"
            aria-label="Refresh data"
            className="border rounded-md text-sm px-2 py-1 hover:bg-muted inline-flex items-center gap-1"
            disabled={refreshLoading}
            onClick={async () => {
              // Append ts param to URL without navigation
              const params = new URLSearchParams(searchParams?.toString() || '');
              params.set('ts', String(Date.now()));
              router.replace(`?${params.toString()}`);
              // Invalidate and refetch all relevant queries
              setRefreshLoading(true);
              try {
                await Promise.all([
                  queryClient.invalidateQueries({ queryKey: QueryKeys.klaviyoMetrics(metricsFromTo) }),
                  queryClient.invalidateQueries({ queryKey: QueryKeys.tripleWhaleMetrics(metricsFromTo) }),
                  queryClient.invalidateQueries({ queryKey: QueryKeys.klaviyoCampaigns(dateRange) }),
                  queryClient.invalidateQueries({ queryKey: ['health'] }),
                  refetchHealth(),
                ]);
                setRefreshAck(true);
                setTimeout(() => setRefreshAck(false), 1500);
              } finally {
                setRefreshLoading(false);
              }
            }}
          >
            {refreshLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            Refresh
          </button>
          {refreshAck && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Refreshed
            </span>
          )}
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
          error={tripleWhaleError instanceof Error ? tripleWhaleError.message : undefined}
          live={tripleWhaleLive}
        />
        <MetricCard
          title="Email Revenue"
          value={klaviyoMetrics?.emailRevenue ? `$${(klaviyoMetrics.emailRevenue / 1000).toFixed(1)}k` : '$0'}
          change={8.2}
          changeType="increase"
          loading={isLoading}
          error={klaviyoError instanceof Error ? klaviyoError.message : undefined}
          live={klaviyoLive}
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
          error={klaviyoError instanceof Error ? klaviyoError.message : undefined}
          live={klaviyoLive && tripleWhaleLive}
        />
        <MetricCard
          title="Conversion Rate"
          value={klaviyoMetrics?.conversionRate ? `${klaviyoMetrics.conversionRate.toFixed(2)}%` : '0%'}
          change={-0.5}
          changeType="decrease"
          loading={isLoading}
          error={klaviyoError instanceof Error ? klaviyoError.message : undefined}
          live={klaviyoLive}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Revenue Comparison</h3>
            {klaviyoLive && tripleWhaleLive && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Live
              </span>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : klaviyoMetrics && tripleWhaleMetrics ? (
            <ComparisonChart
              data={{
                klaviyo: [
                  { date: metricsFromTo.from.toISOString(), value: klaviyoMetrics.emailRevenue, label: 'Email Revenue' }
                ],
                tripleWhale: [
                  { date: metricsFromTo.from.toISOString(), value: tripleWhaleMetrics.totalRevenue, label: 'Total Revenue' }
                ]
              }}
              title="Revenue Attribution"
            />
          ) : (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Revenue data unavailable. Ensure both Klaviyo and Triple Whale live sources are reachable.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
            {klaviyoLive && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Live
              </span>
            )}
          </div>
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
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Recent Campaign Performance</h3>
            {campaignsLive && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Live
              </span>
            )}
          </div>
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
