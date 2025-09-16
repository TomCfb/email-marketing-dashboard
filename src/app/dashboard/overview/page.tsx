"use client";

import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ComparisonChart } from '@/components/charts/comparison-chart';
import { DataTable } from '@/components/shared/data-table';
import { useDateRange } from '@/lib/store/dashboard-store';
import { QueryKeys } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function OverviewPage() {
  const dateRange = useDateRange();

  // Fetch Klaviyo metrics
  const { 
    data: klaviyoResponse, 
    isLoading: klaviyoLoading, 
    error: klaviyoError 
  } = useQuery({
    queryKey: QueryKeys.klaviyoMetrics(dateRange),
    queryFn: async () => {
      const response = await fetch(`/api/klaviyo/metrics?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
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
    queryKey: QueryKeys.tripleWhaleMetrics(dateRange),
    queryFn: async () => {
      const response = await fetch(`/api/triple-whale/metrics?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview Dashboard</h1>
        <p className="text-muted-foreground">
          Cross-platform analytics comparing Klaviyo and Triple Whale performance
        </p>
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
                  { date: '2024-01-01', value: klaviyoMetrics?.emailRevenue || 0, label: 'Email Revenue' }
                ],
                tripleWhale: [
                  { date: '2024-01-01', value: tripleWhaleMetrics?.totalRevenue || 0, label: 'Total Revenue' }
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
        <h3 className="text-lg font-semibold">Recent Campaign Performance</h3>
        {campaignsLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <DataTable
            data={campaigns || []}
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
          />
        )}
      </div>
    </div>
  );
}
