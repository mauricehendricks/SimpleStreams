import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { createDefaultState } from '../state/defaultState';
import { CURRENT_SCHEMA_VERSION, migrateState } from '../state/migrations';
import { usePremiumStore } from '../state/usePremiumStore';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import { APP_STORAGE_KEY } from '../utils/constants';
import { resetAllData } from '../utils/dataReset';

const HYDRATION_TIMEOUT = 5000; // 5 seconds (increased for slower devices)

// Set to true to simulate slow loading for testing skeleton
const SIMULATE_SLOW_LOADING = false;
const SLOW_LOADING_DELAY = 2000; // 2 seconds delay

export type HydrationStatus = 'loading' | 'ready' | 'error';

export function useHydrationGate() {
  const [status, setStatus] = useState<HydrationStatus>('loading');
  const premiumStore = usePremiumStore();
  const hydrationCompletedRef = useRef(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let mounted = true;

    const hydrate = async () => {
      try {
        // Simulate slow loading for testing skeleton
        if (SIMULATE_SLOW_LOADING) {
          await new Promise(resolve => setTimeout(resolve, SLOW_LOADING_DELAY));
        }

        // Load premium status (can happen in parallel)
        await premiumStore.loadPremium();

        // Load app data
        let stored: string | null;
        try {
          stored = await AsyncStorage.getItem(APP_STORAGE_KEY);
        } catch (storageError) {
          // Storage unavailable - show error state
          console.error('[Hydration] AsyncStorage.getItem failed:', storageError);
          if (mounted) {
            hydrationCompletedRef.current = true;
            clearTimeout(timeoutId);
            setStatus('error');
          }
          return;
        }

        if (!mounted) return;

        if (stored === null) {
          // No stored data - use defaults
          const defaultState = createDefaultState();
          useSimpleStreamsStore.setState(defaultState);
          try {
            await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify({
              state: defaultState,
              version: CURRENT_SCHEMA_VERSION,
            }));
          } catch (saveError) {
            console.error('[Hydration] Failed to save default state:', saveError);
          }
          if (mounted) {
            hydrationCompletedRef.current = true;
            clearTimeout(timeoutId);
            setStatus('ready');
          }
          return;
        }

        // Parse JSON
        let parsed: any;
        try {
          parsed = JSON.parse(stored);
        } catch (parseError) {
          // Corrupted data - show error state so user can retry or reset
          console.error('[Hydration] JSON parse error:', parseError);
          console.error('[Hydration] Stored data (first 200 chars):', stored?.substring(0, 200));
          if (mounted) {
            hydrationCompletedRef.current = true;
            clearTimeout(timeoutId);
            setStatus('error');
          }
          return;
        }

        // Unwrap Zustand persist format if needed
        const candidate = parsed && typeof parsed === 'object' && 'state' in parsed ? parsed.state : parsed;
        const migrated = migrateState(candidate);

        if (!mounted) return;

        useSimpleStreamsStore.setState(migrated);
        if (mounted) {
          hydrationCompletedRef.current = true;
          clearTimeout(timeoutId);
          setStatus('ready');
        }
      } catch (error) {
        // Unexpected error - show error state
        console.error('[Hydration] Unexpected hydration error:', error);
        if (mounted) {
          hydrationCompletedRef.current = true;
          clearTimeout(timeoutId);
          setStatus('error');
        }
      }
    };

    // Timeout fallback - show error state
    timeoutId = setTimeout(() => {
      if (mounted && !hydrationCompletedRef.current) {
        console.warn('[Hydration] Hydration timeout - showing error state');
        hydrationCompletedRef.current = true;
        setStatus('error');
      }
    }, HYDRATION_TIMEOUT);

    hydrate();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Only run once on mount

  const retry = async () => {
    setStatus('loading');
    hydrationCompletedRef.current = false;
    try {
      const stored = await AsyncStorage.getItem(APP_STORAGE_KEY);

      if (stored === null) {
        const defaultState = createDefaultState();
        useSimpleStreamsStore.setState(defaultState);
        await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify({
          state: defaultState,
          version: CURRENT_SCHEMA_VERSION,
        }));
        hydrationCompletedRef.current = true;
        setStatus('ready');
        return;
      }

      const parsed = JSON.parse(stored);
      const candidate = parsed && typeof parsed === 'object' && 'state' in parsed ? parsed.state : parsed;
      const migrated = migrateState(candidate);
      useSimpleStreamsStore.setState(migrated);
      hydrationCompletedRef.current = true;
      setStatus('ready');
    } catch (error) {
      // Retry failed - show error state
      console.error('[Hydration] Retry error:', error);
      hydrationCompletedRef.current = true;
      setStatus('error');
    }
  };

  const resetData = async () => {
    try {
      await resetAllData();
      setStatus('ready');
    } catch (error) {
      // Reset failed - show error state
      console.error('[Hydration] Reset error:', error);
      setStatus('error');
    }
  };

  return { status, retry, resetData };
}
