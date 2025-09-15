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
        const config = localStorage.getItem('dashboard-api-config');
        if (!config) return;
        
        try {
          const parsedConfig = JSON.parse(config);
          
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
            } catch (error) {
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
            } catch (error) {
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
