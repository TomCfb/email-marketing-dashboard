"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  Eye, 
  MousePointer, 
  Calendar,
  CheckCircle
} from 'lucide-react';
import { KlaviyoCampaign } from '@/lib/types';

interface CampaignDetailModalProps {
  campaign: KlaviyoCampaign | null;
  isOpen: boolean;
  onClose: () => void;
}

type CampaignStats = {
  recipients: number;
  opens: number;
  openRate: number; // percent
  clicks: number;
  clickRate: number; // percent
  revenue: number;
};

export function CampaignDetailModal({ campaign, isOpen, onClose }: CampaignDetailModalProps) {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'last_12_months' | 'last_24_months' | 'all_time'>('last_12_months');
  const [copied, setCopied] = useState(false);

  const buildApiUrl = () => {
    if (!campaign) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/api/klaviyo/campaigns/${campaign.id}/stats?timeframe=${timeframe}`;
  };

  const handleCopyUrl = async () => {
    try {
      const url = buildApiUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Failed to copy URL');
    }
  };

  // map percentage (0-100) to Tailwind width classes in 12 steps
  const widthClass = (pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct));
    const step = Math.round((clamped / 100) * 12); // 0..12
    const classes = [
      'w-0',
      'w-1/12','w-2/12','w-3/12','w-4/12','w-5/12','w-6/12',
      'w-7/12','w-8/12','w-9/12','w-10/12','w-11/12','w-full'
    ];
    return classes[step];
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!isOpen || !campaign) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/klaviyo/campaigns/${campaign.id}/stats?timeframe=${timeframe}`);
        if (!res.ok) throw new Error(`Failed to load stats (${res.status})`);
        const json = await res.json();
        setStats(json.data as CampaignStats);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isOpen, campaign, timeframe]);

  if (!campaign) return null;

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
                <div className="text-2xl font-bold">{(stats?.recipients ?? campaign.recipients).toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.revenue ?? campaign.revenue)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{(stats?.openRate ?? campaign.openRate).toFixed(1)}%</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Eye className="h-3 w-3 mr-1" />
                  {(stats?.opens ?? campaign.opens).toLocaleString()} opens
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{(stats?.clickRate ?? campaign.clickRate).toFixed(1)}%</div>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <MousePointer className="h-3 w-3 mr-1" />
                  {(stats?.clicks ?? campaign.clicks).toLocaleString()} clicks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance (real data only) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Engagement Metrics</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Timeframe</span>
                  <select
                    aria-label="Timeframe"
                    className="border rounded-md text-sm px-2 py-1"
                    value={timeframe}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeframe(e.target.value as 'last_12_months' | 'last_24_months' | 'all_time')}
                  >
                    <option value="last_12_months">Last 12 months</option>
                    <option value="last_24_months">Last 24 months</option>
                    <option value="all_time">All time</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="border rounded-md text-xs px-2 py-1 hover:bg-muted"
                    aria-label="Copy API URL"
                    title="Copy API URL"
                  >
                    {copied ? 'Copied' : 'Copy API URL'}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              {loading ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Open Rate</span>
                    <span className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full w-1/4 animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Click Rate</span>
                    <span className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full w-1/6 animate-pulse" />
                  </div>
                </>
              ) : !stats ? (
                <p className="text-sm text-gray-500">No stats available for this campaign/timeframe.</p>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Open Rate</span>
                    <span className="font-semibold">{(stats.openRate ?? campaign.openRate).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`bg-orange-500 h-2 rounded-full transition-all duration-300 ${widthClass(stats.openRate ?? campaign.openRate)}`} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Click Rate</span>
                    <span className="font-semibold">{(stats.clickRate ?? campaign.clickRate).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`bg-purple-500 h-2 rounded-full transition-all duration-300 ${widthClass(stats.clickRate ?? campaign.clickRate)}`} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Campaign Details */}
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
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Status</span>
                </div>
                <p className="font-medium">{campaign.status}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
