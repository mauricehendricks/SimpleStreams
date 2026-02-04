import { createDefaultState } from './defaultState';
import { AppState } from './types';

export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Migrate state from any version to current version
 * Always returns a valid AppState - creates default if unrecoverable
 */
export function migrateState(raw: any): AppState {
  if (!raw || typeof raw !== 'object') {
    console.warn('Migration: Raw state is not an object. Using default state.');
    return createDefaultState();
  }

  // Zustand persist stores `{ state, version }` in AsyncStorage. If we're handed that wrapper,
  // unwrap it so validation/migrations run against the actual AppState shape.
  const candidate = (raw && typeof raw === 'object' && 'state' in raw) ? (raw as any).state : raw;

  if (!candidate || typeof candidate !== 'object') {
    console.warn('Migration: Persisted candidate is not an object. Using default state.');
    return createDefaultState();
  }

  // Handle missing schemaVersion (treat as version 0/legacy)
  const schemaVersion = (candidate as any).schemaVersion ?? 0;

  // Invalid or future version - use default
  if (schemaVersion > CURRENT_SCHEMA_VERSION || schemaVersion < 0) {
    console.warn(`Migration: Invalid schema version ${schemaVersion}. Using default state.`);
    return createDefaultState();
  }

  // Current version - validate and fix if needed
  if (schemaVersion === CURRENT_SCHEMA_VERSION) {
    return validateAndFixAppState(candidate);
  }

  // Version 0: Legacy data (no schemaVersion) - treat as version 1 and migrate
  if (schemaVersion === 0) {
    console.log('Migration: Legacy data detected (no schemaVersion). Treating as version 1 and migrating to version 2.');
    // Set schemaVersion to 1 for migration
    (candidate as any).schemaVersion = 1;
    const migrated = migrateV1ToV2(candidate);
    return validateAndFixAppState(migrated);
  }

  // Migrate from version 1 to 2: scenarios → views
  if (schemaVersion === 1) {
    console.log('Migration: Migrating from schema version 1 to 2 (scenarios → views)');
    const migrated = migrateV1ToV2(candidate);
    return validateAndFixAppState(migrated);
  }

  // Future: Add stepwise migrations here
  console.warn(`Migration: No migration path for schema version ${schemaVersion}. Using default state.`);
  return createDefaultState();
}

/**
 * Migrate from schema version 1 to 2
 * Converts scenarios → views, activeScenarioId → activeViewId
 */
function migrateV1ToV2(raw: any): any {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  // Update schema version
  raw.schemaVersion = 2;

  // Migrate profiles
  if (Array.isArray(raw.profiles)) {
    raw.profiles = raw.profiles.map((profile: any) => {
      if (!profile || typeof profile !== 'object') {
        return profile;
      }

      // Rename scenarios → views
      if (profile.scenarios && Array.isArray(profile.scenarios)) {
        profile.views = profile.scenarios;
        delete profile.scenarios;
      }

      // Rename activeScenarioId → activeViewId
      if (profile.activeScenarioId) {
        profile.activeViewId = profile.activeScenarioId;
        delete profile.activeScenarioId;
      }

      return profile;
    });
  }

  return raw;
}

/**
 * Validate and fix AppState structure
 * Always returns a valid AppState - creates default if unrecoverable
 */
function validateAndFixAppState(raw: any): AppState {
  try {
    // Minimal validation
    if (!raw || typeof raw !== 'object') {
      console.warn('Migration: Raw state is not an object. Using default state.');
      return createDefaultState();
    }

    // Ensure schemaVersion is a number
    if (typeof raw.schemaVersion !== 'number') {
      raw.schemaVersion = CURRENT_SCHEMA_VERSION;
    }

    // Ensure profiles is an array
    if (!Array.isArray(raw.profiles)) {
      console.warn('Migration: profiles is not an array. Using default state.');
      return createDefaultState();
    }

    // Ensure at least one profile exists
    if (raw.profiles.length === 0) {
      console.warn('Migration: No profiles found. Using default state.');
      return createDefaultState();
    }

    // Ensure activeProfileId is a string
    if (typeof raw.activeProfileId !== 'string') {
      // Try to use first profile's id
      if (raw.profiles.length > 0 && raw.profiles[0]?.id) {
        raw.activeProfileId = raw.profiles[0].id;
      } else {
        console.warn('Migration: Cannot determine activeProfileId. Using default state.');
        return createDefaultState();
      }
    }

    // Ensure activeProfileId exists
    let activeProfile = raw.profiles.find(
      (p: any) => p.id === raw.activeProfileId
    );
    
    if (!activeProfile) {
      // Try to use first profile
      if (raw.profiles.length > 0) {
        activeProfile = raw.profiles[0];
        raw.activeProfileId = activeProfile.id;
      } else {
        console.warn('Migration: Cannot find active profile. Using default state.');
        return createDefaultState();
      }
    }

    // Ensure views array exists (handle both old 'scenarios' and new 'views')
    if (!Array.isArray(activeProfile.views)) {
      // Try to migrate from old 'scenarios' if it exists
      if (Array.isArray(activeProfile.scenarios)) {
        activeProfile.views = activeProfile.scenarios;
        delete activeProfile.scenarios;
      } else {
        activeProfile.views = [];
      }
    }

    // Ensure at least one view exists
    if (activeProfile.views.length === 0) {
      // Create default view
      activeProfile.views = [{
        id: 'view-1',
        name: 'View',
        income: [],
        expenses: [],
        taxAllocationRate: 30,
      }];
      activeProfile.activeViewId = 'view-1';
    }

    // Handle migration from activeScenarioId to activeViewId
    if (activeProfile.activeScenarioId && !activeProfile.activeViewId) {
      activeProfile.activeViewId = activeProfile.activeScenarioId;
      delete activeProfile.activeScenarioId;
    }

    // Ensure activeViewId is a string
    if (typeof activeProfile.activeViewId !== 'string') {
      activeProfile.activeViewId = activeProfile.views[0]?.id || 'view-1';
    }

    // Ensure activeViewId exists in views
    const activeView = activeProfile.views.find(
      (v: any) => v.id === activeProfile.activeViewId
    );
    
    if (!activeView) {
      // Use first view
      if (activeProfile.views.length > 0) {
        activeProfile.activeViewId = activeProfile.views[0].id;
      } else {
        console.warn('Migration: Cannot find active view. Using default state.');
        return createDefaultState();
      }
    }

    // Validate stream arrays
    const viewToValidate = activeProfile.views.find(
      (v: any) => v.id === activeProfile.activeViewId
    );
    if (viewToValidate) {
      if (!Array.isArray(viewToValidate.income)) {
        viewToValidate.income = [];
      }
      if (!Array.isArray(viewToValidate.expenses)) {
        viewToValidate.expenses = [];
      }
      if (typeof viewToValidate.taxAllocationRate !== 'number') {
        viewToValidate.taxAllocationRate = 30;
      }
    }

    return raw as AppState;
  } catch (error) {
    console.error('Migration: Validation error:', error);
    return createDefaultState();
  }
}
