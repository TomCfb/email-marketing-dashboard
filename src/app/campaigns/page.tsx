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
  Mail, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Calendar,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { KlaviyoCampaign, ApiResponse } from '@/lib/types';

interface CampaignMetrics {
  totalCampaigns: number;
  totalRevenue: number;
  avgOpenRate: number;
  avgClickRate: number;
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<KlaviyoCampaign[]>([]);
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('sentAt');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/klaviyo/campaigns');
      const data: ApiResponse<KlaviyoCampaign[]> = await response.json();
      
      if (data.success && data.data) {
        setCampaigns(data.data);
        calculateMetrics(data.data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (campaignData: KlaviyoCampaign[]) => {
    const totalRevenue = campaignData.reduce((sum, campaign) => sum + campaign.revenue, 0);
    const totalSent = campaignData.reduce((sum, campaign) => sum + campaign.recipients, 0);
    const totalOpens = campaignData.reduce((sum, campaign) => sum + campaign.opens, 0);
    const totalClicks = campaignData.reduce((sum, campaign) => sum + campaign.clicks, 0);
    const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
    const avgClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;

    setMetrics({
      totalCampaigns: campaignData.length,
      totalRevenue,
      avgOpenRate,
      avgClickRate,
      totalSent,
      totalOpens,
      totalClicks
    });
  };

  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'sentAt':
          return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
        case 'revenue':
          return b.revenue - a.revenue;
        case 'openRate':
          return b.openRate - a.openRate;
        case 'clickRate':
          return b.clickRate - a.clickRate;
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="h-8 w-8 text-blue-600" />
              Email Campaigns
            </h1>
            <p className="text-gray-600 mt-1">Manage and analyze your email marketing campaigns</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Metrics Overview */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Campaigns</CardTitle>
                <Mail className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.totalCampaigns}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  Active campaigns
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  From email campaigns
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.avgOpenRate.toFixed(1)}%</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  Above industry avg
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Click Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metrics.avgClickRate.toFixed(1)}%</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  Strong engagement
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
                    placeholder="Search campaigns..."
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
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sentAt">Date Sent</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="openRate">Open Rate</SelectItem>
                  <SelectItem value="clickRate">Click Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        <Card className="bg-white shadow-sm border-0 ring-1 ring-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Campaigns</CardTitle>
            <CardDescription>
              {filteredCampaigns.length} of {campaigns.length} campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{campaign.subject}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(campaign.sentAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {campaign.recipients.toLocaleString()} recipients
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{campaign.openRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Open Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{campaign.clickRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Click Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{campaign.conversionRate.toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">Conversion</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{formatCurrency(campaign.revenue)}</div>
                          <div className="text-xs text-gray-500">Revenue</div>
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
      </div>
    </div>
  );
}
