"use client";

import { useEffect } from 'react';
import { useConnectionStore } from '@/lib/store/connection-store';

export function useConnectionInit() {
  const { testConnections } = useConnectionStore();

  useEffect(() => {
    // Initialize connections when the app loads
    const initConnections = async () => {
      try {
        await testConnections();
      } catch (error) {
        console.error('Failed to initialize connections:', error);
      }
    };

    // Run immediately and then set up periodic testing
    initConnections();

    // Test connections every 5 minutes
    const interval = setInterval(initConnections, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [testConnections]);
}
