"use client";

import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '@/components/dashboard/metric-card';
import { DataTable } from '@/components/shared/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDateRange } from '@/lib/store/dashboard-store';
import { QueryKeys } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, MousePointer, Mail, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { KlaviyoCampaign } from '@/lib/types';

export default function EmailPerformancePage() {
  const dateRange = useDateRange();

  // Fetch campaigns
  const { 
    data: campaigns, 
    isLoading: campaignsLoading, 
    error: campaignsError 
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

  // Fetch flows
  const { 
    data: flows, 
    isLoading: flowsLoading, 
    error: flowsError 
  } = useQuery({
    queryKey: QueryKeys.klaviyoFlows(),
    queryFn: async () => {
      const response = await fetch('/api/klaviyo/flows');
      if (!response.ok) throw new Error('Failed to fetch flows');
      return response.json();
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch email metrics
  const { 
    isLoading: metricsLoading,
    error: metricsError 
  } = useQuery({
    queryKey: QueryKeys.klaviyoMetrics(dateRange),
    queryFn: async () => {
      const response = await fetch(`/api/klaviyo/metrics?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch email metrics');
      return response.json();
    },
    retry: 3,
    retryDelay: 1000,
  });

  const isLoading = campaignsLoading || flowsLoading || metricsLoading;
  const hasError = campaignsError || flowsError || metricsError;

  // Calculate aggregate metrics
  const campaignData = campaigns?.data || [];
  const flowData = flows?.data || [];
  
  const totalSent = campaignData.reduce((sum: number, campaign: KlaviyoCampaign) => sum + (campaign.recipients || 0), 0);
  const totalOpens = campaignData.reduce((sum: number, campaign: KlaviyoCampaign) => sum + (campaign.opens || 0), 0);
  const totalClicks = campaignData.reduce((sum: number, campaign: KlaviyoCampaign) => sum + (campaign.clicks || 0), 0);
  const totalRevenue = campaignData.reduce((sum: number, campaign: KlaviyoCampaign) => sum + (campaign.revenue || 0), 0);

  const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
  const avgClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;
  const avgCTOR = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;

  // Prepare chart data
  const performanceData = campaignData.slice(0, 10).map((campaign: KlaviyoCampaign) => ({
    name: campaign.name?.substring(0, 20) + '...' || 'Untitled',
    openRate: campaign.openRate || 0,
    clickRate: campaign.clickRate || 0,
    revenue: campaign.revenue || 0,
  }));

  if (hasError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load email performance data. Please check your Klaviyo API connection.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Email Performance</h1>
        <p className="text-muted-foreground">
          Detailed analysis of email campaigns, flows, and engagement metrics
        </p>
      </div>

      {/* Email KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Campaigns"
          value={campaignData.length}
          change={15.2}
          changeType="increase"
          loading={isLoading}
        />
        <MetricCard
          title="Average Open Rate"
          value={`${avgOpenRate.toFixed(2)}%`}
          change={2.1}
          changeType="increase"
          loading={isLoading}
        />
        <MetricCard
          title="Average Click Rate"
          value={`${avgClickRate.toFixed(2)}%`}
          change={-0.8}
          changeType="decrease"
          loading={isLoading}
        />
        <MetricCard
          title="Email Revenue"
          value={`$${(totalRevenue / 1000).toFixed(1)}k`}
          change={8.7}
          changeType="increase"
          loading={isLoading}
        />
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="openRate" fill="#3B82F6" name="Open Rate %" />
                  <Bar dataKey="clickRate" fill="#8B5CF6" name="Click Rate %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-to-Open Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCTOR.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flows</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flowData.length}</div>
            <p className="text-xs text-muted-foreground">
              Automated email sequences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue per Email</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSent > 0 ? (totalRevenue / totalSent).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average revenue per sent email
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Campaign Performance Details</h3>
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <DataTable
            data={campaignData}
            columns={[
              {
                key: 'name',
                header: 'Campaign Name',
                sortable: true,
              },
              {
                key: 'status',
                header: 'Status',
                render: (value: string) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value === 'sent' ? 'bg-green-100 text-green-800' :
                    value === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {value}
                  </span>
                ),
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
                key: 'conversionRate',
                header: 'Conversion Rate',
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

      {/* Flow Performance Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Flow Performance</h3>
        {flowsLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <DataTable
            data={flowData}
            columns={[
              {
                key: 'name',
                header: 'Flow Name',
                sortable: true,
              },
              {
                key: 'status',
                header: 'Status',
                render: (value: string) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value === 'active' ? 'bg-green-100 text-green-800' :
                    value === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {value}
                  </span>
                ),
              },
              {
                key: 'emails',
                header: 'Emails',
                sortable: true,
              },
              {
                key: 'subscribers',
                header: 'Subscribers',
                sortable: true,
                render: (value: number) => value.toLocaleString(),
              },
              {
                key: 'conversionRate',
                header: 'Conversion Rate',
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
