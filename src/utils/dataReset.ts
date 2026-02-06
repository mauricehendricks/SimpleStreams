import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDefaultState } from '../state/defaultState';
import { CURRENT_SCHEMA_VERSION } from '../state/migrations';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import { APP_STORAGE_KEY } from './constants';

/**
 * Resets all app data to defaults.
 * This function:
 * 1. Clears AsyncStorage key (removes Zustand persist data and any legacy data)
 * 2. Resets in-memory state to defaults
 * 3. Force saves default state in Zustand persist format
 * 
 * This ensures the storage is in sync and clears any legacy format.
 */
export async function resetAllData(): Promise<void> {
  // Clear AsyncStorage key (removes Zustand persist data and any legacy data)
  await AsyncStorage.removeItem(APP_STORAGE_KEY);
  // Reset in-memory state to defaults
  useSimpleStreamsStore.getState().resetAllDataToDefaults();
  // Force save default state in Zustand persist format
  // This ensures the storage is in sync and clears any legacy format
  const defaultState = createDefaultState();
  await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify({
    state: defaultState,
    version: CURRENT_SCHEMA_VERSION,
  }));
}
