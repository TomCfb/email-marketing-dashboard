"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ComparisonChartData } from '@/lib/types';

interface ComparisonChartProps {
  data: ComparisonChartData;
  title: string;
  className?: string;
}

export function ComparisonChart({ data, title, className }: ComparisonChartProps) {
  // Combine data for comparison
  const chartData = data.klaviyo.map((klaviyoPoint, index) => ({
    date: klaviyoPoint.date,
    klaviyo: klaviyoPoint.value,
    tripleWhale: data.tripleWhale[index]?.value || 0,
    klaviyoLabel: klaviyoPoint.label || 'Klaviyo',
    tripleWhaleLabel: data.tripleWhale[index]?.label || 'Triple Whale',
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name === 'klaviyo' ? 'Email Revenue' : 'Total Revenue'
              ]}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Legend />
            <Bar 
              dataKey="klaviyo" 
              fill="#3B82F6" 
              name="Email Revenue"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="tripleWhale" 
              fill="#8B5CF6" 
              name="Total Revenue"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
