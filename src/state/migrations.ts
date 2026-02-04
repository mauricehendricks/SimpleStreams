import { createDefaultState } from './defaultState';
import { AppState } from './types';

export const CURRENT_SCHEMA_VERSION = 3;

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
    console.log('Migration: Legacy data detected (no schemaVersion). Treating as version 1 and migrating to version 3.');
    // Set schemaVersion to 1 for migration
    (candidate as any).schemaVersion = 1;
    let migrated = migrateV1ToV2(candidate);
    migrated = migrateV2ToV3(migrated);
    return validateAndFixAppState(migrated);
  }

  // Migrate from version 1 to 2: scenarios → views
  if (schemaVersion === 1) {
    console.log('Migration: Migrating from schema version 1 to 2 (scenarios → views)');
    let migrated = migrateV1ToV2(candidate);
    migrated = migrateV2ToV3(migrated);
    return validateAndFixAppState(migrated);
  }

  // Migrate from version 2 to 3: remove Profile wrapper, flatten to views[]
  if (schemaVersion === 2) {
    console.log('Migration: Migrating from schema version 2 to 3 (removing Profile wrapper)');
    const migrated = migrateV2ToV3(candidate);
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
 * Migrate from schema version 2 to 3
 * Removes Profile wrapper and flattens to views[] array
 */
function migrateV2ToV3(raw: any): any {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  // Update schema version
  raw.schemaVersion = 3;

  // Extract all views from all profiles into a flat array
  const allViews: any[] = [];
  let activeViewId: string | null = null;

  if (Array.isArray(raw.profiles)) {
    raw.profiles.forEach((profile: any) => {
      if (!profile || typeof profile !== 'object') {
        return;
      }

      const profileName = profile.name || 'Dashboard';
      const views = profile.views || [];

      views.forEach((view: any) => {
        if (!view || typeof view !== 'object') {
          return;
        }

        // If there are multiple views in a profile, combine names
        // Otherwise keep the view name as-is
        const viewName = views.length > 1 
          ? `${profileName} - ${view.name || 'Dashboard'}`
          : (view.name || 'Dashboard');

        allViews.push({
          ...view,
          name: viewName,
        });

        // If this is the active profile and active view, remember it
        if (profile.id === raw.activeProfileId && view.id === profile.activeViewId) {
          activeViewId = view.id;
        }
      });
    });
  }

  // Set the flattened views array
  raw.views = allViews;

  // Set activeViewId (use the active view from active profile, or first view)
  raw.activeViewId = activeViewId || (allViews.length > 0 ? allViews[0].id : 'view-1');

  // Remove old profile-related fields
  delete raw.profiles;
  delete raw.activeProfileId;

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

    // For schema version 3+, validate flat views structure
    if (raw.schemaVersion >= 3) {
      // Ensure views is an array
      if (!Array.isArray(raw.views)) {
        console.warn('Migration: views is not an array. Using default state.');
        return createDefaultState();
      }

      // Ensure at least one view exists
      if (raw.views.length === 0) {
        console.warn('Migration: No views found. Using default state.');
        return createDefaultState();
      }

      // Ensure activeViewId is a string
      if (typeof raw.activeViewId !== 'string') {
        // Try to use first view's id
        if (raw.views.length > 0 && raw.views[0]?.id) {
          raw.activeViewId = raw.views[0].id;
        } else {
          console.warn('Migration: Cannot determine activeViewId. Using default state.');
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
          console.warn('Migration: Cannot find active view. Using default state.');
          return createDefaultState();
        }
      }

      // Validate stream arrays for active view
      const viewToValidate = raw.views.find(
        (v: any) => v.id === raw.activeViewId
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
    } else {
      // For older schema versions (0-2), this function shouldn't be called
      // as they should be migrated first
      console.warn('Migration: validateAndFixAppState called on old schema version. Using default state.');
      return createDefaultState();
    }

    return raw as AppState;
  } catch (error) {
    console.error('Migration: Validation error:', error);
    return createDefaultState();
  }
}
