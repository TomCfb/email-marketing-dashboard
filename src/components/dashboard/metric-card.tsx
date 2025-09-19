"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  trend?: Array<{ date: string; value: number }>;
  loading?: boolean;
  error?: string;
  className?: string;
  live?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  changeType,
  loading = false,
  error,
  className,
  live,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[120px] mb-2" />
          <Skeleton className="h-3 w-[80px]" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-destructive">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {live && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Live
            </span>
          )}
          {change !== undefined && (
          <div className={cn(
            "flex items-center text-xs",
            changeType === 'increase' ? "text-green-600" : "text-red-600"
          )}>
            {changeType === 'increase' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
          </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={cn(
            "text-xs mt-1",
            changeType === 'increase' ? "text-green-600" : "text-red-600"
          )}>
            {changeType === 'increase' ? '+' : ''}{change}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
