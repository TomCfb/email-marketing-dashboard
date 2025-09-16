import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DashboardStore, DateRange, SyncStatus } from '../types';

// Default date range (last 30 days)
const getDefaultDateRange = (): DateRange => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  
  return { from, to };
};

// Default sync status
const getDefaultSyncStatus = (): SyncStatus => ({
  klaviyo: {
    endpoint: process.env.KLAVIYO_MCP_ENDPOINT || 'http://localhost:3001/klaviyo',
    apiKey: process.env.KLAVIYO_API_KEY || '',
    isConnected: false,
    lastSync: new Date().toISOString(),
    health: 'down',
  },
  tripleWhale: {
    endpoint: process.env.TRIPLE_WHALE_MCP_ENDPOINT || 'http://localhost:3002/triple-whale',
    apiKey: process.env.TRIPLE_WHALE_API_KEY || '',
    isConnected: false,
    lastSync: new Date().toISOString(),
    health: 'down',
  },
  lastFullSync: new Date().toISOString(),
  isRunning: false,
  progress: 0,
});

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      // State
      dateRange: getDefaultDateRange(),
      selectedMetrics: ['revenue', 'campaigns', 'openRate', 'clickRate'],
      activeFilters: {},
      syncStatus: getDefaultSyncStatus(),

      // Actions
      setDateRange: (range: DateRange) => {
        set({ dateRange: range });
      },

      setSelectedMetrics: (metrics: string[]) => {
        set({ selectedMetrics: metrics });
      },

      setActiveFilters: (filters: Record<string, any>) => {
        set({ activeFilters: filters });
      },

      updateSyncStatus: (status: Partial<SyncStatus>) => {
        const currentStatus = get().syncStatus;
        set({
          syncStatus: {
            ...currentStatus,
            ...status,
          },
        });
      },
    }),
    {
      name: 'email-dashboard-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dateRange: state.dateRange,
        selectedMetrics: state.selectedMetrics,
        activeFilters: state.activeFilters,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.dateRange) {
          // Convert string dates back to Date objects after rehydration
          state.dateRange = {
            from: new Date(state.dateRange.from),
            to: new Date(state.dateRange.to),
          };
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useDateRange = () => useDashboardStore((state) => state.dateRange);
export const useSelectedMetrics = () => useDashboardStore((state) => state.selectedMetrics);
export const useActiveFilters = () => useDashboardStore((state) => state.activeFilters);
export const useSyncStatus = () => useDashboardStore((state) => state.syncStatus);
