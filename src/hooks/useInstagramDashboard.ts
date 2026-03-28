import { useState, useEffect, useCallback, useRef } from 'react';
import { getInstagramDashboardData } from '@/api/instagram';
import { InstagramDashboardData } from '@/types/instagram.types';

export function useInstagramDashboard(session: any) {
  const [data, setData] = useState<InstagramDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // To avoid multiple concurrent requests
  const fetchCountRef = useRef(0);

  const fetchDashboardData = useCallback(async () => {
    if (!session?.access_token) {
      console.warn('[useInstagramDashboard] No access token available');
      return;
    }

    const currentFetchId = ++fetchCountRef.current;
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useInstagramDashboard] Fetching with token:', session.access_token.substring(0, 20) + '...');
      const result = await getInstagramDashboardData(session.access_token);
      console.log('[useInstagramDashboard] Received data:', { 
        connected: result.connected, 
        hasProfile: !!result.profile,
        hasMedia: result.recent_media?.length > 0 
      });

      // Only update state if this is still the most recent fetch
      if (currentFetchId === fetchCountRef.current) {
        setData(result);
      }
    } catch (err: any) {
      if (currentFetchId === fetchCountRef.current) {
        console.error('[useInstagramDashboard] Error:', err);
        setError(err.message || 'Failed to fetch Instagram data');
      }
    } finally {
      if (currentFetchId === fetchCountRef.current) {
        setIsLoading(false);
      }
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchDashboardData
  };
}
