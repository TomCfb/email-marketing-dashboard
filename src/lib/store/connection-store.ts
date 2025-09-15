import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConnectionStatus {
  klaviyo: 'connected' | 'disconnected' | 'testing';
  tripleWhale: 'connected' | 'disconnected' | 'testing';
}

interface ConnectionStore {
  connectionStatus: ConnectionStatus;
  setKlaviyoStatus: (status: 'connected' | 'disconnected' | 'testing') => void;
  setTripleWhaleStatus: (status: 'connected' | 'disconnected' | 'testing') => void;
  testConnections: () => Promise<void>;
}

export const useConnectionStore = create<ConnectionStore>()(
  persist(
    (set, get) => ({
      connectionStatus: {
        klaviyo: 'disconnected',
        tripleWhale: 'disconnected',
      },
      
      setKlaviyoStatus: (status) =>
        set((state) => ({
          connectionStatus: { ...state.connectionStatus, klaviyo: status },
        })),
      
      setTripleWhaleStatus: (status) =>
        set((state) => ({
          connectionStatus: { ...state.connectionStatus, tripleWhale: status },
        })),
      
      testConnections: async () => {
        // Try to get config from localStorage, fallback to default API keys
        let parsedConfig;
        const config = localStorage.getItem('dashboard-api-config');
        
        if (config) {
          try {
            parsedConfig = JSON.parse(config);
          } catch (err) {
            console.error('Error parsing config:', err);
            parsedConfig = null;
          }
        }
        
        // Use default API keys if no config found
        if (!parsedConfig) {
          parsedConfig = {
            klaviyoApiKey: 'pk_e144c1c656ee0812ec48376bc1391f2033',
            klaviyoEndpoint: 'https://a.klaviyo.com/api',
            tripleWhaleApiKey: 'b8b87c3d-f7d9-4f9f-a79a-99a52fd5fa84',
            tripleWhaleEndpoint: 'https://api.triplewhale.com',
          };
        }
        
        try {
          
          // Test Klaviyo
          if (parsedConfig.klaviyoApiKey) {
            get().setKlaviyoStatus('testing');
            
            try {
              const response = await fetch('/api/test/klaviyo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  apiKey: parsedConfig.klaviyoApiKey,
                  endpoint: parsedConfig.klaviyoEndpoint,
                }),
              });
              
              const result = await response.json();
              get().setKlaviyoStatus(result.success ? 'connected' : 'disconnected');
            } catch (err) {
              console.error('Klaviyo connection failed:', err);
              get().setKlaviyoStatus('disconnected');
            }
          }
          
          // Test Triple Whale
          if (parsedConfig.tripleWhaleApiKey) {
            get().setTripleWhaleStatus('testing');
            
            try {
              const response = await fetch('/api/test/triple-whale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  apiKey: parsedConfig.tripleWhaleApiKey,
                  endpoint: parsedConfig.tripleWhaleEndpoint,
                }),
              });
              
              const result = await response.json();
              get().setTripleWhaleStatus(result.success ? 'connected' : 'disconnected');
            } catch (err) {
              console.error('Triple Whale connection failed:', err);
              get().setTripleWhaleStatus('disconnected');
            }
          }
        } catch (error) {
          console.error('Error testing connections:', error);
        }
      },
    }),
    {
      name: 'connection-status',
    }
  )
);
