"use client";

import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '@/components/dashboard/metric-card';
import { DataTable } from '@/components/shared/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDateRange } from '@/lib/store/dashboard-store';
import { QueryKeys } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

export default function CustomerInsightsPage() {
  const dateRange = useDateRange();

  // Fetch unified customer data
  const { 
    data: customers, 
    isLoading: customersLoading, 
    error: customersError 
  } = useQuery({
    queryKey: QueryKeys.unifiedCustomers(),
    queryFn: async () => {
      const response = await fetch('/api/sync/customers');
      if (!response.ok) throw new Error('Failed to fetch customer data');
      return response.json();
    },
  });

  // Fetch Triple Whale metrics for context
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

  const isLoading = customersLoading || twLoading;
  const hasError = customersError;

  // Process customer data
  const customerData = customers?.data || [];
  
  // Calculate customer segments
  const vipCustomers = customerData.filter((c: any) => c.lifetimeValue > 1000);
  const atRiskCustomers = customerData.filter((c: any) => c.riskScore > 70);
  const highEngagementCustomers = customerData.filter((c: any) => c.engagementScore > 80);
  
  // Prepare chart data
  const engagementVsSpendingData = customerData.slice(0, 50).map((customer: any) => ({
    engagement: customer.engagementScore || 0,
    spending: customer.totalSpent || 0,
    orders: customer.orderCount || 0,
    email: customer.email,
  }));

  const cohortData = [
    { month: 'Jan', newCustomers: 120, returning: 80, retention: 66.7 },
    { month: 'Feb', newCustomers: 150, returning: 95, retention: 63.3 },
    { month: 'Mar', newCustomers: 180, returning: 125, retention: 69.4 },
    { month: 'Apr', newCustomers: 200, returning: 145, retention: 72.5 },
  ];

  const segmentData = [
    { segment: 'VIP Customers', count: vipCustomers.length, value: vipCustomers.reduce((sum: number, c: any) => sum + c.lifetimeValue, 0) },
    { segment: 'High Engagement', count: highEngagementCustomers.length, value: highEngagementCustomers.reduce((sum: number, c: any) => sum + c.totalSpent, 0) },
    { segment: 'At Risk', count: atRiskCustomers.length, value: atRiskCustomers.reduce((sum: number, c: any) => sum + c.totalSpent, 0) },
    { segment: 'New Customers', count: customerData.filter((c: any) => c.orderCount === 1).length, value: 0 },
  ];

  if (hasError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load customer insights data. Please check your API connections.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Insights</h1>
        <p className="text-muted-foreground">
          Unified customer analysis combining email engagement and purchase behavior
        </p>
      </div>

      {/* Customer KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Customers"
          value={customerData.length.toLocaleString()}
          change={8.2}
          changeType="increase"
          loading={isLoading}
        />
        <MetricCard
          title="VIP Customers"
          value={vipCustomers.length.toLocaleString()}
          change={15.3}
          changeType="increase"
          loading={isLoading}
        />
        <MetricCard
          title="At Risk Customers"
          value={atRiskCustomers.length.toLocaleString()}
          change={-5.1}
          changeType="decrease"
          loading={isLoading}
        />
        <MetricCard
          title="Avg Engagement Score"
          value={customerData.length > 0 
            ? (customerData.reduce((sum: number, c: any) => sum + (c.engagementScore || 0), 0) / customerData.length).toFixed(1)
            : '0'
          }
          change={3.7}
          changeType="increase"
          loading={isLoading}
        />
      </div>

      {/* Customer Analysis Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Engagement vs Spending</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={engagementVsSpendingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="engagement" 
                    name="Engagement Score"
                    domain={[0, 100]}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="spending" 
                    name="Total Spent"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: number, name: string) => [
                      name === 'spending' ? `$${value}` : value,
                      name === 'spending' ? 'Total Spent' : 'Engagement Score'
                    ]}
                  />
                  <Scatter dataKey="spending" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Retention Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cohortData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="retention" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Retention Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={segmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" />
                <YAxis tickFormatter={(value) => value.toLocaleString()} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'value' ? `$${value.toLocaleString()}` : value.toLocaleString(),
                    name === 'value' ? 'Total Value' : 'Customer Count'
                  ]}
                />
                <Bar dataKey="count" fill="#3B82F6" name="Customer Count" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Customer Segment Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vipCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              LTV > $1,000
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highEngagementCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              Engagement > 80%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atRiskCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              Risk Score > 70%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerData.filter((c: any) => c.orderCount === 1).length}
            </div>
            <p className="text-xs text-muted-foreground">
              First-time buyers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Details</h3>
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : (
          <DataTable
            data={customerData.slice(0, 100)} // Limit for performance
            columns={[
              {
                key: 'email',
                header: 'Email',
                sortable: true,
              },
              {
                key: 'firstName',
                header: 'Name',
                render: (value: string, row: any) => 
                  `${value || ''} ${row.lastName || ''}`.trim() || 'N/A',
              },
              {
                key: 'totalSpent',
                header: 'Total Spent',
                sortable: true,
                render: (value: number) => `$${value.toFixed(2)}`,
              },
              {
                key: 'orderCount',
                header: 'Orders',
                sortable: true,
              },
              {
                key: 'averageOrderValue',
                header: 'AOV',
                sortable: true,
                render: (value: number) => `$${value.toFixed(2)}`,
              },
              {
                key: 'engagementScore',
                header: 'Engagement',
                sortable: true,
                render: (value: number) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value > 80 ? 'bg-green-100 text-green-800' :
                    value > 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {value?.toFixed(0) || '0'}%
                  </span>
                ),
              },
              {
                key: 'riskScore',
                header: 'Risk Score',
                sortable: true,
                render: (value: number) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value > 70 ? 'bg-red-100 text-red-800' :
                    value > 40 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {value?.toFixed(0) || '0'}%
                  </span>
                ),
              },
              {
                key: 'predictedChurn',
                header: 'Churn Risk',
                render: (value: boolean) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {value ? 'High' : 'Low'}
                  </span>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
