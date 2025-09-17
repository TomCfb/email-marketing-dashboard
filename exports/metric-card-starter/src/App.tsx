import React from 'react';
import { MetricCard } from './components/metric-card';

export default function App() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Metric Card Starter</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Email Revenue" value="$12.4k" change={8.2} changeType="increase" />
        <MetricCard title="Open Rate" value="24.3%" change={-1.2} changeType="decrease" />
        <MetricCard title="Click Rate" value="2.9%" />
        <MetricCard title="Orders" value={213} change={4.6} changeType="increase" />
      </div>
    </div>
  );
}
