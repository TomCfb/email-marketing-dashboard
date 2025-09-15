"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConnectionStore } from '@/lib/store/connection-store';

export function RefreshIndicator() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { connectionStatus, testConnections } = useConnectionStore();

  // Test connections on component mount
  useEffect(() => {
    testConnections();
  }, [testConnections]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await testConnections();
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'testing':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
      default:
        return <XCircle className="h-3 w-3 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'testing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="h-8 px-2"
      >
        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      </Button>
      
      <div className="flex items-center space-x-1">
        <Badge 
          variant="outline" 
          className={cn("flex items-center space-x-1", getStatusColor(connectionStatus.klaviyo))}
        >
          {getStatusIcon(connectionStatus.klaviyo)}
          <span className="text-xs">Klaviyo</span>
        </Badge>
        
        <Badge 
          variant="outline" 
          className={cn("flex items-center space-x-1", getStatusColor(connectionStatus.tripleWhale))}
        >
          {getStatusIcon(connectionStatus.tripleWhale)}
          <span className="text-xs">Triple Whale</span>
        </Badge>
      </div>
    </div>
  );
}
