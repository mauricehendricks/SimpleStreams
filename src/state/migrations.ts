import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREMIUM_STORAGE_KEY } from '../utils/constants';
import { createDefaultState } from './defaultState';
import { AppState } from './types';

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Validate and fix AppState structure.
 * Returns valid AppState or default if unrecoverable.
 */
export function migrateState(raw: any): AppState {
  // Clean up premium storage key (no longer needed)
  AsyncStorage.removeItem(PREMIUM_STORAGE_KEY).catch(() => {
    // Ignore errors - key may not exist
  });

  if (!raw || typeof raw !== 'object') {
    console.warn('[Migration] Raw state is not an object. Using default state.');
    return createDefaultState();
  }

  // Unwrap Zustand persist format if needed
  const candidate = (raw && typeof raw === 'object' && 'state' in raw) ? (raw as any).state : raw;

  if (!candidate || typeof candidate !== 'object') {
    console.warn('[Migration] Persisted candidate is not an object. Using default state.');
    return createDefaultState();
  }

  // Fix schema version if missing/wrong type, then validate
  let schemaVersion = (candidate as any).schemaVersion;
  if (typeof schemaVersion !== 'number') {
    schemaVersion = CURRENT_SCHEMA_VERSION;
    (candidate as any).schemaVersion = CURRENT_SCHEMA_VERSION;
  }
  
  if (schemaVersion !== CURRENT_SCHEMA_VERSION) {
    console.warn(`[Migration] Schema version ${schemaVersion} does not match current version ${CURRENT_SCHEMA_VERSION}. Using default state.`);
    return createDefaultState();
  }

  return validateAndFixAppState(candidate);
}

/**
 * Validate and fix AppState structure.
 * Returns valid AppState or default if unrecoverable.
 */
function validateAndFixAppState(raw: any): AppState {
  try {
    if (!raw || typeof raw !== 'object') {
      console.warn('[Migration] Raw state is not an object in validateAndFixAppState. Using default state.');
      return createDefaultState();
    }

    // Ensure schemaVersion is correct
    if (typeof raw.schemaVersion !== 'number' || raw.schemaVersion !== CURRENT_SCHEMA_VERSION) {
      raw.schemaVersion = CURRENT_SCHEMA_VERSION;
    }

    // Ensure views is an array
    if (!Array.isArray(raw.views)) {
      console.warn('[Migration] views is not an array. Using default state.');
      return createDefaultState();
    }

    // Ensure at least one view exists
    if (raw.views.length === 0) {
      console.warn('[Migration] No views found. Using default state.');
      return createDefaultState();
    }

    // Ensure activeViewId is a string
    if (typeof raw.activeViewId !== 'string') {
      // Try to use first view's id
      if (raw.views.length > 0 && raw.views[0]?.id) {
        raw.activeViewId = raw.views[0].id;
      } else {
        console.warn('[Migration] Cannot determine activeViewId. Using default state.');
        return createDefaultState();
      }
    }

    // Ensure activeViewId exists in views
    const activeView = raw.views.find(
      (v: any) => v.id === raw.activeViewId
    );
    
    if (!activeView) {
      // Use first view
      if (raw.views.length > 0) {
        raw.activeViewId = raw.views[0].id;
      } else {
        console.warn('[Migration] Cannot find active view. Using default state.');
        return createDefaultState();
      }
    }

    // Fix invalid view properties
    raw.views.forEach((view: any) => {
      if (view && typeof view === 'object') {
        // Validate and fix stream arrays
        if (!Array.isArray(view.income)) {
          view.income = [];
        }
        if (!Array.isArray(view.expenses)) {
          view.expenses = [];
        }
        if (typeof view.taxAllocationRate !== 'number') {
          view.taxAllocationRate = 30;
        }
      }
    });

    return raw as AppState;
  } catch (error) {
    console.error('[Migration] Validation error:', error);
    return createDefaultState();
  }
}
