"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Loader2, Settings, Key, TestTube } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectionStatus {
  klaviyo: 'connected' | 'disconnected' | 'testing';
  tripleWhale: 'connected' | 'disconnected' | 'testing';
}

interface ApiConfig {
  klaviyoApiKey: string;
  klaviyoEndpoint: string;
  tripleWhaleApiKey: string;
  tripleWhaleEndpoint: string;
  useMockData: boolean;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ApiConfig>({
    klaviyoApiKey: '',
    klaviyoEndpoint: 'https://a.klaviyo.com/api',
    tripleWhaleApiKey: '',
    tripleWhaleEndpoint: 'https://api.triplewhale.com',
    useMockData: false,
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    klaviyo: 'disconnected',
    tripleWhale: 'disconnected',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load saved configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem('dashboard-api-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (error) {
        console.error('Error loading saved config:', error);
      }
    }

    // Load from environment variables if available
    if (typeof window !== 'undefined') {
      setConfig(prev => ({
        ...prev,
        klaviyoApiKey: prev.klaviyoApiKey || process.env.NEXT_PUBLIC_KLAVIYO_API_KEY || '',
        tripleWhaleApiKey: prev.tripleWhaleApiKey || process.env.NEXT_PUBLIC_TRIPLE_WHALE_API_KEY || '',
      }));
    }
  }, []);

  const testKlaviyoConnection = async () => {
    if (!config.klaviyoApiKey) {
      toast.error('Please enter a Klaviyo API key');
      return;
    }

    setConnectionStatus(prev => ({ ...prev, klaviyo: 'testing' }));

    try {
      const response = await fetch('/api/test/klaviyo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.klaviyoApiKey,
          endpoint: config.klaviyoEndpoint,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setConnectionStatus(prev => ({ ...prev, klaviyo: 'connected' }));
        toast.success('Klaviyo connection successful!');
      } else {
        setConnectionStatus(prev => ({ ...prev, klaviyo: 'disconnected' }));
        toast.error(`Klaviyo connection failed: ${result.error}`);
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, klaviyo: 'disconnected' }));
      toast.error('Klaviyo connection test failed');
      console.error('Klaviyo test error:', error);
    }
  };

  const testTripleWhaleConnection = async () => {
    if (!config.tripleWhaleApiKey) {
      toast.error('Please enter a Triple Whale API key');
      return;
    }

    setConnectionStatus(prev => ({ ...prev, tripleWhale: 'testing' }));

    try {
      const response = await fetch('/api/test/triple-whale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.tripleWhaleApiKey,
          endpoint: config.tripleWhaleEndpoint,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setConnectionStatus(prev => ({ ...prev, tripleWhale: 'connected' }));
        toast.success('Triple Whale connection successful!');
      } else {
        setConnectionStatus(prev => ({ ...prev, tripleWhale: 'disconnected' }));
        toast.error(`Triple Whale connection failed: ${result.error}`);
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, tripleWhale: 'disconnected' }));
      toast.error('Triple Whale connection test failed');
      console.error('Triple Whale test error:', error);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);

    try {
      // Save to localStorage
      localStorage.setItem('dashboard-api-config', JSON.stringify(config));

      // Save to server (optional)
      await fetch('/api/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      toast.success('Configuration saved successfully!');
    } catch (error) {
      toast.error('Failed to save configuration');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      default:
        return <Badge variant="destructive">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your API connections and dashboard preferences
        </p>
      </div>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          {/* Connection Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Connection Status
              </CardTitle>
              <CardDescription>
                Current status of your API connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(connectionStatus.klaviyo)}
                  <span className="font-medium">Klaviyo</span>
                </div>
                {getStatusBadge(connectionStatus.klaviyo)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(connectionStatus.tripleWhale)}
                  <span className="font-medium">Triple Whale</span>
                </div>
                {getStatusBadge(connectionStatus.tripleWhale)}
              </div>
            </CardContent>
          </Card>

          {/* Klaviyo Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Klaviyo Configuration
              </CardTitle>
              <CardDescription>
                Configure your Klaviyo API connection for email marketing data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="klaviyo-api-key">API Key</Label>
                <Input
                  id="klaviyo-api-key"
                  type="password"
                  placeholder="pk_..."
                  value={config.klaviyoApiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, klaviyoApiKey: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground">
                  Your Klaviyo private API key (starts with pk_)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="klaviyo-endpoint">API Endpoint</Label>
                <Input
                  id="klaviyo-endpoint"
                  placeholder="https://a.klaviyo.com/api"
                  value={config.klaviyoEndpoint}
                  onChange={(e) => setConfig(prev => ({ ...prev, klaviyoEndpoint: e.target.value }))}
                />
              </div>

              <Button 
                onClick={testKlaviyoConnection}
                disabled={connectionStatus.klaviyo === 'testing' || !config.klaviyoApiKey}
                className="w-full"
              >
                {connectionStatus.klaviyo === 'testing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Test Klaviyo Connection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Triple Whale Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Triple Whale Configuration
              </CardTitle>
              <CardDescription>
                Configure your Triple Whale API connection for e-commerce data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="triple-whale-api-key">API Key</Label>
                <Input
                  id="triple-whale-api-key"
                  type="password"
                  placeholder="Your Triple Whale API key"
                  value={config.tripleWhaleApiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, tripleWhaleApiKey: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="triple-whale-endpoint">API Endpoint</Label>
                <Input
                  id="triple-whale-endpoint"
                  placeholder="https://api.triplewhale.com"
                  value={config.tripleWhaleEndpoint}
                  onChange={(e) => setConfig(prev => ({ ...prev, tripleWhaleEndpoint: e.target.value }))}
                />
              </div>

              <Button 
                onClick={testTripleWhaleConnection}
                disabled={connectionStatus.tripleWhale === 'testing' || !config.tripleWhaleApiKey}
                className="w-full"
              >
                {connectionStatus.tripleWhale === 'testing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Test Triple Whale Connection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Development Options */}
          <Card>
            <CardHeader>
              <CardTitle>Development Options</CardTitle>
              <CardDescription>
                Options for testing and development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mock-data">Use Mock Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Use sample data instead of real API calls for testing
                  </p>
                </div>
                <Switch
                  id="mock-data"
                  checked={config.useMockData}
                  onCheckedChange={(checked: boolean) => setConfig(prev => ({ ...prev, useMockData: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={saveConfiguration} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Preferences</CardTitle>
              <CardDescription>
                Customize your dashboard experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Additional preferences will be added in future updates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
