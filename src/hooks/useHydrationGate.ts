import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { createDefaultState } from '../state/defaultState';
import { CURRENT_SCHEMA_VERSION, migrateState } from '../state/migrations';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import { APP_STORAGE_KEY } from '../utils/constants';
import { resetAllData } from '../utils/dataReset';

const HYDRATION_TIMEOUT = 5000; // 5 seconds (increased for slower devices)

// Set to true to simulate slow loading for testing skeleton
const SIMULATE_SLOW_LOADING = false;
const SLOW_LOADING_DELAY = 2000; // 2 seconds delay

export type HydrationStatus = 'loading' | 'ready' | 'error';

/**
 * Core hydration logic shared between hydrate and retry functions.
 * Handles loading, parsing, migrating, and setting app state from storage.
 * 
 * @param stored - The stored JSON string from AsyncStorage, or null if not found
 * @returns true if hydration succeeded, false if it failed
 */
async function hydrateFromStoredData(stored: string | null): Promise<boolean> {
  try {
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
      return true;
    }

    // Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(stored);
    } catch (parseError) {
      // Corrupted data
      console.error('[Hydration] JSON parse error:', parseError);
      console.error('[Hydration] Stored data (first 200 chars):', stored?.substring(0, 200));
      return false;
    }

    // Unwrap Zustand persist format if needed
    const candidate = parsed && typeof parsed === 'object' && 'state' in parsed ? parsed.state : parsed;
    const migrated = migrateState(candidate);

    useSimpleStreamsStore.setState(migrated);
    return true;
  } catch (error) {
    // Unexpected error
    console.error('[Hydration] Unexpected hydration error:', error);
    return false;
  }
}

export function useHydrationGate() {
  const [status, setStatus] = useState<HydrationStatus>('loading');
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

        const success = await hydrateFromStoredData(stored);
        if (mounted) {
          hydrationCompletedRef.current = true;
          clearTimeout(timeoutId);
          setStatus(success ? 'ready' : 'error');
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
      const success = await hydrateFromStoredData(stored);
      hydrationCompletedRef.current = true;
      setStatus(success ? 'ready' : 'error');
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
