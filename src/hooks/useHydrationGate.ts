import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { createDefaultState } from '../state/defaultState';
import { migrateState } from '../state/migrations';
import { usePremiumStore } from '../state/usePremiumStore';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';

const APP_STORAGE_KEY = 'simple_streams_state_v1';

const HYDRATION_TIMEOUT = 5000; // 5 seconds (increased for slower devices)

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
        // Load premium status (can happen in parallel)
        await premiumStore.loadPremium();

        // Load app data
        let stored: string | null;
        try {
          stored = await AsyncStorage.getItem(APP_STORAGE_KEY);
        } catch (storageError) {
          console.error('AsyncStorage.getItem failed:', storageError);
          if (mounted) {
            hydrationCompletedRef.current = true;
            clearTimeout(timeoutId);
            setStatus('error');
          }
          return;
        }

        if (!mounted) return;

        if (stored === null) {
          // No stored data - use defaults and save to storage
          const defaultState = createDefaultState();
          useSimpleStreamsStore.setState(defaultState);
          // Save default state to AsyncStorage
          try {
            await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify(defaultState));
          } catch (saveError) {
            console.error('Failed to save default state:', saveError);
            // Continue anyway - state is set in memory
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
          console.error('JSON parse error:', parseError);
          console.error('Stored data:', stored?.substring(0, 200));
          // Try to recover with default state
          const defaultState = createDefaultState();
          useSimpleStreamsStore.setState(defaultState);
          try {
            await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify(defaultState));
          } catch (saveError) {
            console.error('Failed to save recovered state:', saveError);
          }
          if (mounted) {
            hydrationCompletedRef.current = true;
            clearTimeout(timeoutId);
            setStatus('ready');
          }
          return;
        }

        // Zustand persist stores `{ state, version }` in AsyncStorage. Unwrap if needed.
        const candidate = parsed && typeof parsed === 'object' && 'state' in parsed ? parsed.state : parsed;

        // Migrate state (always returns valid state, creates default if needed)
        const migrated = migrateState(candidate);

        if (!mounted) return;

        // Set migrated state (Zustand persist will handle saving on next state change)
        useSimpleStreamsStore.setState(migrated);
        if (mounted) {
          hydrationCompletedRef.current = true;
          clearTimeout(timeoutId);
          setStatus('ready');
        }
      } catch (error) {
        console.error('Unexpected hydration error:', error);
        // Try to recover with default state
        try {
          const defaultState = createDefaultState();
          useSimpleStreamsStore.setState(defaultState);
          await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify(defaultState));
        } catch (recoveryError) {
          console.error('Recovery also failed:', recoveryError);
        }
        if (mounted) {
          hydrationCompletedRef.current = true;
          clearTimeout(timeoutId);
          setStatus('error');
        }
      }
    };

    // Set timeout
    timeoutId = setTimeout(() => {
      if (mounted && !hydrationCompletedRef.current) {
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
        // Save default state to AsyncStorage
        await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify(defaultState));
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
      console.error('Retry error:', error);
      hydrationCompletedRef.current = true;
      setStatus('error');
    }
  };

  const resetData = async () => {
    try {
      // Clear AsyncStorage key (removes Zustand persist data and any legacy data)
      await AsyncStorage.removeItem(APP_STORAGE_KEY);
      // Reset in-memory state to defaults
      useSimpleStreamsStore.getState().resetAllDataToDefaults();
      // Force save default state in Zustand persist format
      // This ensures the storage is in sync and clears any legacy format
      const defaultState = createDefaultState();
      await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify({
        state: defaultState,
        version: 2,
      }));
      setStatus('ready');
    } catch (error) {
      console.error('Reset error:', error);
      setStatus('error');
    }
  };

  return { status, retry, resetData };
}
