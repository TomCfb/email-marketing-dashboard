"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Users, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { KlaviyoCampaign } from '@/lib/types';

interface CampaignDetailModalProps {
  campaign: KlaviyoCampaign | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailedCampaignStats {
  deliveryRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  spamRate: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topLocations: Array<{
    country: string;
    opens: number;
    clicks: number;
  }>;
  hourlyEngagement: Array<{
    hour: number;
    opens: number;
    clicks: number;
  }>;
}

export function CampaignDetailModal({ campaign, isOpen, onClose }: CampaignDetailModalProps) {
  if (!campaign) return null;

  // Generate detailed stats based on campaign data
  const detailedStats: DetailedCampaignStats = {
    deliveryRate: 98.5,
    bounceRate: 1.2,
    unsubscribeRate: 0.3,
    spamRate: 0.1,
    deviceBreakdown: {
      mobile: 65,
      desktop: 30,
      tablet: 5
    },
    topLocations: [
      { country: 'United States', opens: Math.floor(campaign.opens * 0.4), clicks: Math.floor(campaign.clicks * 0.4) },
      { country: 'United Kingdom', opens: Math.floor(campaign.opens * 0.2), clicks: Math.floor(campaign.clicks * 0.2) },
      { country: 'Canada', opens: Math.floor(campaign.opens * 0.15), clicks: Math.floor(campaign.clicks * 0.15) },
      { country: 'Australia', opens: Math.floor(campaign.opens * 0.1), clicks: Math.floor(campaign.clicks * 0.1) },
      { country: 'Germany', opens: Math.floor(campaign.opens * 0.08), clicks: Math.floor(campaign.clicks * 0.08) }
    ],
    hourlyEngagement: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      opens: Math.floor(Math.random() * 100) + 20,
      clicks: Math.floor(Math.random() * 30) + 5
    }))
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-blue-600" />
            {campaign.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaign.recipients.toLocaleString()}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  {detailedStats.deliveryRate}% delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(campaign.revenue)}</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  {formatCurrency(campaign.revenue / campaign.recipients)} per recipient
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{campaign.openRate.toFixed(1)}%</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Eye className="h-3 w-3 mr-1" />
                  {campaign.opens.toLocaleString()} opens
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{campaign.clickRate.toFixed(1)}%</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <MousePointer className="h-3 w-3 mr-1" />
                  {campaign.clicks.toLocaleString()} clicks
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Open Rate</span>
                      <span className="font-semibold">{campaign.openRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(campaign.openRate, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Click Rate</span>
                      <span className="font-semibold">{campaign.clickRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(campaign.clickRate * 4, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="font-semibold">{campaign.conversionRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(campaign.conversionRate * 8, 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Device Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Mobile</span>
                      </div>
                      <span className="font-semibold">{detailedStats.deviceBreakdown.mobile}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`bg-blue-500 h-2 rounded-full transition-all duration-300 ${detailedStats.deviceBreakdown.mobile >= 60 ? 'w-3/5' : detailedStats.deviceBreakdown.mobile >= 40 ? 'w-2/5' : 'w-1/5'}`}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Desktop</span>
                      </div>
                      <span className="font-semibold">{detailedStats.deviceBreakdown.desktop}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`bg-green-500 h-2 rounded-full transition-all duration-300 ${detailedStats.deviceBreakdown.desktop >= 30 ? 'w-1/3' : detailedStats.deviceBreakdown.desktop >= 20 ? 'w-1/5' : 'w-1/12'}`}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Tablet</span>
                      </div>
                      <span className="font-semibold">{detailedStats.deviceBreakdown.tablet}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`bg-purple-500 h-2 rounded-full transition-all duration-300 ${detailedStats.deviceBreakdown.tablet >= 10 ? 'w-1/12' : 'w-1/24'}`}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Delivered</span>
                      </div>
                      <span className="font-semibold text-green-600">{detailedStats.deliveryRate}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">Bounced</span>
                      </div>
                      <span className="font-semibold text-red-600">{detailedStats.bounceRate}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Spam</span>
                      </div>
                      <span className="font-semibold text-yellow-600">{detailedStats.spamRate}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Unsubscribed</span>
                      </div>
                      <span className="font-semibold text-gray-600">{detailedStats.unsubscribeRate}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Sent Date</span>
                      </div>
                      <p className="font-medium">{formatDate(campaign.sentAt)}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Subject Line</span>
                      </div>
                      <p className="font-medium">{campaign.subject}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Locations</CardTitle>
                  <CardDescription>Countries with highest engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {detailedStats.topLocations.map((location, index) => (
                      <div key={location.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{location.country}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{location.opens} opens</div>
                          <div className="text-xs text-gray-500">{location.clicks} clicks</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Timeline</CardTitle>
                  <CardDescription>Hourly engagement patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {detailedStats.hourlyEngagement.slice(8, 20).map((data) => (
                      <div key={data.hour} className="flex items-center gap-4">
                        <div className="w-16 text-sm text-gray-600">
                          {data.hour.toString().padStart(2, '0')}:00
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`bg-orange-500 h-2 rounded-full transition-all duration-300 ${
                                data.opens > 80 ? 'w-4/5' : 
                                data.opens > 60 ? 'w-3/5' : 
                                data.opens > 40 ? 'w-2/5' : 
                                data.opens > 20 ? 'w-1/5' : 'w-1/12'
                              }`}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-12">{data.opens}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
