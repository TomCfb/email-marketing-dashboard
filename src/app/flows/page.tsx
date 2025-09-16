"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Workflow, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Play, 
  Pause, 
  Calendar,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Clock,
  Target,
  Mail
} from 'lucide-react';
import { KlaviyoFlow, ApiResponse } from '@/lib/types';

interface FlowMetrics {
  totalFlows: number;
  activeFlows: number;
  totalRevenue: number;
  avgConversionRate: number;
  totalSubscribers: number;
}

export default function FlowsPage() {
  const [flows, setFlows] = useState<KlaviyoFlow[]>([]);
  const [metrics, setMetrics] = useState<FlowMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/klaviyo/flows');
      const data: ApiResponse<KlaviyoFlow[]> = await response.json();
      
      if (data.success && data.data) {
        setFlows(data.data);
        calculateMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching flows:', error);
      // Use fallback data for demo
      const fallbackFlows: KlaviyoFlow[] = [
        {
          id: 'flow_001',
          name: 'Welcome Series',
          status: 'active',
          emails: 3,
          revenue: 15420.50,
          conversionRate: 8.5,
          subscribers: 2340
        },
        {
          id: 'flow_002',
          name: 'Abandoned Cart Recovery',
          status: 'active',
          emails: 2,
          revenue: 8750.25,
          conversionRate: 12.3,
          subscribers: 1850
        },
        {
          id: 'flow_003',
          name: 'Post-Purchase Follow-up',
          status: 'active',
          emails: 4,
          revenue: 5230.75,
          conversionRate: 6.8,
          subscribers: 980
        },
        {
          id: 'flow_004',
          name: 'Win-Back Campaign',
          status: 'paused',
          emails: 2,
          revenue: 3420.00,
          conversionRate: 4.2,
          subscribers: 1200
        },
        {
          id: 'flow_005',
          name: 'Birthday Rewards',
          status: 'active',
          emails: 1,
          revenue: 2180.30,
          conversionRate: 15.6,
          subscribers: 450
        }
      ];
      setFlows(fallbackFlows);
      calculateMetrics(fallbackFlows);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (flowData: KlaviyoFlow[]) => {
    const totalRevenue = flowData.reduce((sum, flow) => sum + flow.revenue, 0);
    const totalSubscribers = flowData.reduce((sum, flow) => sum + flow.subscribers, 0);
    const activeFlows = flowData.filter(flow => flow.status === 'active').length;
    const avgConversionRate = flowData.length > 0 
      ? flowData.reduce((sum, flow) => sum + flow.conversionRate, 0) / flowData.length 
      : 0;

    setMetrics({
      totalFlows: flowData.length,
      activeFlows,
      totalRevenue,
      avgConversionRate,
      totalSubscribers
    });
  };

  const filteredFlows = flows
    .filter(flow => {
      const matchesSearch = flow.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || flow.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.revenue - a.revenue;
        case 'conversionRate':
          return b.conversionRate - a.conversionRate;
        case 'subscribers':
          return b.subscribers - a.subscribers;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Workflow className="h-8 w-8 text-purple-600" />
              Email Flows
            </h1>
            <p className="text-gray-600 mt-1">Automate your email marketing with intelligent flows</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Flow
          </Button>
        </div>

        {/* Metrics Overview */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Flows</CardTitle>
                <Workflow className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.totalFlows}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  {metrics.activeFlows} active
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Flows</CardTitle>
                <Zap className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.activeFlows}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Play className="h-3 w-3 mr-1 text-green-500" />
                  Running automation
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Flow Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  From automation
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Conversion</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.avgConversionRate.toFixed(1)}%</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  High performance
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Subscribers</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.totalSubscribers.toLocaleString()}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  In active flows
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search flows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="conversionRate">Conversion Rate</SelectItem>
                  <SelectItem value="subscribers">Subscribers</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Flow Performance Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Flows List */}
            <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Email Flows</CardTitle>
                <CardDescription>
                  {filteredFlows.length} of {flows.length} flows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredFlows.map((flow) => (
                      <div
                        key={flow.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-gray-900">{flow.name}</h3>
                              <Badge className={getStatusColor(flow.status)}>
                                {getStatusIcon(flow.status)}
                                <span className="ml-1">{flow.status}</span>
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {flow.emails} emails
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {flow.subscribers.toLocaleString()} subscribers
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-purple-600">{flow.conversionRate.toFixed(1)}%</div>
                              <div className="text-xs text-gray-500">Conversion Rate</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">{formatCurrency(flow.revenue)}</div>
                              <div className="text-xs text-gray-500">Revenue</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-blue-600">{(flow.revenue / flow.subscribers).toFixed(0)}</div>
                              <div className="text-xs text-gray-500">Revenue per User</div>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Top Performing Flows</CardTitle>
                  <CardDescription>Ranked by conversion rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flows
                      .sort((a, b) => b.conversionRate - a.conversionRate)
                      .slice(0, 5)
                      .map((flow, index) => (
                        <div key={flow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{flow.name}</div>
                              <div className="text-sm text-gray-500">{flow.subscribers} subscribers</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-purple-600">{flow.conversionRate.toFixed(1)}%</div>
                            <div className="text-sm text-gray-500">{formatCurrency(flow.revenue)}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Revenue Leaders</CardTitle>
                  <CardDescription>Flows generating the most revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flows
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5)
                      .map((flow, index) => (
                        <div key={flow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{flow.name}</div>
                              <div className="text-sm text-gray-500">{flow.conversionRate.toFixed(1)}% conversion</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">{formatCurrency(flow.revenue)}</div>
                            <div className="text-sm text-gray-500">{flow.subscribers} subscribers</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-green-600">Active Automations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{metrics?.activeFlows}</div>
                  <p className="text-sm text-gray-600">Flows currently running and sending emails automatically</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-yellow-600">Paused Flows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {flows.filter(f => f.status === 'paused').length}
                  </div>
                  <p className="text-sm text-gray-600">Flows that are temporarily stopped</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-600">Draft Flows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {flows.filter(f => f.status === 'draft').length}
                  </div>
                  <p className="text-sm text-gray-600">Flows being prepared for launch</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
