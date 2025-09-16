"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, RefreshCw, Download, Trash2 } from 'lucide-react';
import { logger, LogLevel } from '@/lib/logger';

interface ErrorSummary {
  category: string;
  count: number;
  lastError: string;
}

export function ErrorMonitor() {
  const [logs, setLogs] = useState<any[]>([]);
  const [errorSummary, setErrorSummary] = useState<ErrorSummary[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>(LogLevel.ERROR);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refreshLogs = () => {
    const allLogs = logger.getLogs();
    const errorLogs = logger.getLogs(LogLevel.ERROR);
    const summary = logger.getErrorSummary();
    
    setLogs(allLogs);
    setErrorSummary(summary);
  };

  useEffect(() => {
    refreshLogs();
    
    if (autoRefresh) {
      const interval = setInterval(refreshLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const clearLogs = () => {
    logger.clearLogs();
    refreshLogs();
  };

  const exportLogs = () => {
    const logData = JSON.stringify(logs, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => log.level >= selectedLevel);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG: return 'bg-gray-100 text-gray-800';
      case LogLevel.INFO: return 'bg-blue-100 text-blue-800';
      case LogLevel.WARN: return 'bg-yellow-100 text-yellow-800';
      case LogLevel.ERROR: return 'bg-red-100 text-red-800';
      case LogLevel.CRITICAL: return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelName = (level: LogLevel) => {
    return LogLevel[level];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-Time Error Monitor</h2>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={refreshLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={clearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Error Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {errorSummary.map((error, index) => (
          <Card key={index} className="border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{error.category}</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{error.count}</div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {error.lastError}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs">Detailed Logs</TabsTrigger>
          <TabsTrigger value="api">API Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Badge
              variant={selectedLevel === LogLevel.DEBUG ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedLevel(LogLevel.DEBUG)}
            >
              DEBUG
            </Badge>
            <Badge
              variant={selectedLevel === LogLevel.INFO ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedLevel(LogLevel.INFO)}
            >
              INFO
            </Badge>
            <Badge
              variant={selectedLevel === LogLevel.WARN ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedLevel(LogLevel.WARN)}
            >
              WARN
            </Badge>
            <Badge
              variant={selectedLevel === LogLevel.ERROR ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedLevel(LogLevel.ERROR)}
            >
              ERROR
            </Badge>
            <Badge
              variant={selectedLevel === LogLevel.CRITICAL ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedLevel(LogLevel.CRITICAL)}
            >
              CRITICAL
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Log Entries ({filteredLogs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredLogs.slice().reverse().map((log, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 space-y-2 bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getLevelColor(log.level)}>
                            {getLevelName(log.level)}
                          </Badge>
                          <Badge variant="outline">{log.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {log.requestId && (
                          <Badge variant="outline" className="text-xs">
                            {log.requestId}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm font-medium">{log.message}</div>
                      
                      {log.context && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">
                            Context
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </details>
                      )}
                      
                      {log.error && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-red-600">
                            Error Details
                          </summary>
                          <div className="mt-2 p-2 bg-red-50 rounded">
                            <div className="font-medium text-red-800">
                              {log.error.message}
                            </div>
                            {log.error.stack && (
                              <pre className="mt-1 text-red-700 overflow-x-auto">
                                {log.error.stack}
                              </pre>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Request Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Klaviyo API</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {logs.filter(l => l.category === 'KLAVIYO_API' && l.level < LogLevel.ERROR).length}
                      </div>
                      <p className="text-xs text-muted-foreground">Successful requests</p>
                      <div className="text-lg font-semibold text-red-600 mt-2">
                        {logs.filter(l => l.category === 'KLAVIYO_API' && l.level >= LogLevel.ERROR).length}
                      </div>
                      <p className="text-xs text-muted-foreground">Failed requests</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Triple Whale API</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {logs.filter(l => l.category === 'TRIPLE_WHALE_API' && l.level < LogLevel.ERROR).length}
                      </div>
                      <p className="text-xs text-muted-foreground">Successful requests</p>
                      <div className="text-lg font-semibold text-red-600 mt-2">
                        {logs.filter(l => l.category === 'TRIPLE_WHALE_API' && l.level >= LogLevel.ERROR).length}
                      </div>
                      <p className="text-xs text-muted-foreground">Failed requests</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">API Routes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {logs.filter(l => l.category.startsWith('API_') && l.level < LogLevel.ERROR).length}
                      </div>
                      <p className="text-xs text-muted-foreground">Successful responses</p>
                      <div className="text-lg font-semibold text-red-600 mt-2">
                        {logs.filter(l => l.category.startsWith('API_') && l.level >= LogLevel.ERROR).length}
                      </div>
                      <p className="text-xs text-muted-foreground">Failed responses</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Monitor real-time API performance and identify issues immediately.</p>
                  <p>All API requests and responses are logged with detailed context for debugging.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
