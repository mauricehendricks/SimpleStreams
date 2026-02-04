import type { AppState, Profile, View } from './types';

// Default state factory (fresh install)
export function createDefaultState(): AppState {
  const defaultView: View = {
    id: 'view-1',
    name: 'View',
    income: [],
    expenses: [],
    taxAllocationRate: 30,
  };

  const defaultProfile: Profile = {
    id: 'profile-1',
    name: 'Personal',
    views: [defaultView],
    activeViewId: 'view-1',
  };

  return {
    schemaVersion: 2,
    profiles: [defaultProfile],
    activeProfileId: 'profile-1',
  };
}

