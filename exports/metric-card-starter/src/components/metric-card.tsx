import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export type ChangeType = 'increase' | 'decrease';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: ChangeType; // 'increase' | 'decrease'
  loading?: boolean;
  className?: string;
  renderIcon?: React.ReactNode; // Optional icon element on the right side of header
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'increase',
  loading = false,
  className,
  renderIcon,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-3 w-3 rounded bg-muted animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-7 w-24 rounded bg-muted animate-pulse" />
          <p className="mt-2 h-4 w-32 rounded bg-muted animate-pulse" />
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
        {renderIcon ?? null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {typeof change === 'number' && (
          <p
            className={[
              'text-xs mt-1',
              changeType === 'increase' ? 'text-green-600' : 'text-red-600',
            ].join(' ')}
          >
            {changeType === 'increase' ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}
