"use client";

import { Badge } from '@/components/ui/badge';
import { useSyncStatus } from '@/lib/store/dashboard-store';
import { CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';

export function RefreshIndicator() {
  const syncStatus = useSyncStatus();

  const getStatusIcon = (health: string, isRunning: boolean) => {
    if (isRunning) {
      return <Loader2 className="h-3 w-3 animate-spin" />;
    }
    
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-3 w-3" />;
      case 'degraded':
        return <AlertCircle className="h-3 w-3" />;
      case 'down':
        return <XCircle className="h-3 w-3" />;
      default:
        return <XCircle className="h-3 w-3" />;
    }
  };

  const getStatusVariant = (health: string, isRunning: boolean) => {
    if (isRunning) return 'secondary';
    
    switch (health) {
      case 'healthy':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'down':
        return 'destructive';
      default:
        return 'destructive';
    }
  };

  const getStatusText = (health: string, isRunning: boolean) => {
    if (isRunning) return 'Syncing...';
    
    switch (health) {
      case 'healthy':
        return 'Connected';
      case 'degraded':
        return 'Degraded';
      case 'down':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const klaviyoHealth = syncStatus.klaviyo.health;
  const tripleWhaleHealth = syncStatus.tripleWhale.health;
  const isRunning = syncStatus.isRunning;

  // Overall health is the worst of the two
  const overallHealth = klaviyoHealth === 'down' || tripleWhaleHealth === 'down' 
    ? 'down' 
    : klaviyoHealth === 'degraded' || tripleWhaleHealth === 'degraded'
    ? 'degraded'
    : 'healthy';

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        variant={getStatusVariant(overallHealth, isRunning)}
        className="flex items-center space-x-1"
      >
        {getStatusIcon(overallHealth, isRunning)}
        <span className="text-xs">{getStatusText(overallHealth, isRunning)}</span>
      </Badge>
      
      {/* Individual platform status on hover */}
      <div className="hidden md:flex items-center space-x-1">
        <Badge 
          variant="outline" 
          className="text-xs"
          title={`Klaviyo: ${getStatusText(klaviyoHealth, false)}`}
        >
          K
        </Badge>
        <Badge 
          variant="outline" 
          className="text-xs"
          title={`Triple Whale: ${getStatusText(tripleWhaleHealth, false)}`}
        >
          TW
        </Badge>
      </div>
    </div>
  );
}
