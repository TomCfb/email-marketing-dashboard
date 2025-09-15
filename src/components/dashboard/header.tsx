"use client";

import { Button } from '@/components/ui/button';
import { MobileSidebar } from './sidebar';
import { DateRangePicker } from './date-range-picker';
import { RefreshIndicator } from './refresh-indicator';
import { useSyncStatus } from '@/lib/store/dashboard-store';
import { RefreshCw, Settings } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const syncStatus = useSyncStatus();

  const handleRefresh = async () => {
    // Trigger data refresh
    console.log('Refreshing data...');
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <MobileSidebar />
        
        <div className="flex flex-1 items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg font-semibold">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <DateRangePicker />
            <RefreshIndicator />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={syncStatus.isRunning}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.isRunning ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
