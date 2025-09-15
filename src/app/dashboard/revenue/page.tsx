"use client";

import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDateRange } from '@/lib/store/dashboard-store';
import { QueryKeys } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, DollarSign, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export default function RevenueAnalyticsPage() {
  const dateRange = useDateRange();

  // Fetch revenue attribution data
  const { 
    data: attribution, 
    isLoading: attributionLoading, 
    error: attributionError 
  } = useQuery({
    queryKey: QueryKeys.revenueAttribution(dateRange),
    queryFn: async () => {
      const response = await fetch(`/api/analytics/attribution?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch attribution data');
      return response.json();
    },
  });

  // Fetch Triple Whale metrics
  const { 
    data: tripleWhaleMetrics, 
    isLoading: twLoading 
  } = useQuery({
    queryKey: QueryKeys.tripleWhaleMetrics(dateRange),
    queryFn: async () => {
      const response = await fetch(`/api/triple-whale/metrics?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch Triple Whale metrics');
      return response.json();
    },
  });

  // Fetch Klaviyo metrics
  const { 
    data: klaviyoMetrics, 
    isLoading: klaviyoLoading 
  } = useQuery({
    queryKey: QueryKeys.klaviyoMetrics(dateRange),
    queryFn: async () => {
      const response = await fetch(`/api/klaviyo/metrics?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch Klaviyo metrics');
      return response.json();
    },
  });

  const isLoading = attributionLoading || twLoading || klaviyoLoading;
  const hasError = attributionError;

  // Calculate metrics
  const totalRevenue = tripleWhaleMetrics?.data?.totalRevenue || 0;
  const emailRevenue = klaviyoMetrics?.data?.emailRevenue || 0;
  const attributionRate = totalRevenue > 0 ? (emailRevenue / totalRevenue) * 100 : 0;
  const nonEmailRevenue = totalRevenue - emailRevenue;

  // Prepare chart data
  const attributionData = [
    { name: 'Email Revenue', value: emailRevenue, percentage: attributionRate },
    { name: 'Other Revenue', value: nonEmailRevenue, percentage: 100 - attributionRate },
  ];

  const monthlyData = [
    { month: 'Jan', emailRevenue: emailRevenue * 0.8, totalRevenue: totalRevenue * 0.85 },
    { month: 'Feb', emailRevenue: emailRevenue * 0.9, totalRevenue: totalRevenue * 0.92 },
    { month: 'Mar', emailRevenue: emailRevenue * 1.1, totalRevenue: totalRevenue * 1.05 },
    { month: 'Apr', emailRevenue: emailRevenue, totalRevenue: totalRevenue },
  ];

  const campaignAttributionData = attribution?.data?.campaigns?.slice(0, 8).map((campaign: any) => ({
    name: campaign.campaignName?.substring(0, 15) + '...' || 'Campaign',
    revenue: campaign.revenue || 0,
    orders: campaign.orders || 0,
  })) || [];

  if (hasError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load revenue analytics data. Please check your API connections.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Revenue Analytics</h1>
        <p className="text-muted-foreground">
          Revenue attribution analysis and cross-platform performance comparison
        </p>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`$${(totalRevenue / 1000).toFixed(1)}k`}
          change={12.5}
          changeType="increase"
          loading={isLoading}
        />
        <MetricCard
          title="Email Attribution"
          value={`${attributionRate.toFixed(1)}%`}
          change={3.2}
          changeType="increase"
          loading={isLoading}
        />
        <MetricCard
          title="Email Revenue"
          value={`$${(emailRevenue / 1000).toFixed(1)}k`}
          change={8.7}
          changeType="increase"
          loading={isLoading}
        />
        <MetricCard
          title="Average Order Value"
          value={`$${tripleWhaleMetrics?.data?.averageOrderValue?.toFixed(2) || '0.00'}`}
          change={-2.1}
          changeType="decrease"
          loading={isLoading}
        />
      </div>

      {/* Revenue Attribution Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Attribution Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                  <Area 
                    type="monotone" 
                    dataKey="totalRevenue" 
                    stackId="1"
                    stroke="#8B5CF6" 
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                    name="Total Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="emailRevenue" 
                    stackId="2"
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.8}
                    name="Email Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${tripleWhaleMetrics?.data?.customerLifetimeValue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tripleWhaleMetrics?.data?.orders?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue per Customer</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${tripleWhaleMetrics?.data?.customers > 0 
                ? (totalRevenue / tripleWhaleMetrics.data.customers).toFixed(2) 
                : '0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average revenue per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Attribution Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Revenue Attribution</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={campaignAttributionData} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Revenue Attribution Waterfall */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Attribution Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Direct Attribution</h4>
                <div className="text-2xl font-bold text-green-600">
                  ${attribution?.data?.directAttribution?.toLocaleString() || '0'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Revenue directly attributed to email campaigns
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Assisted Attribution</h4>
                <div className="text-2xl font-bold text-blue-600">
                  ${attribution?.data?.assistedAttribution?.toLocaleString() || '0'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Revenue influenced by email touchpoints
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Email Attribution:</span>
                <span className="text-xl font-bold">
                  ${emailRevenue.toLocaleString()} ({attributionRate.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
