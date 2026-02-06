import type { AppState, View } from './types';

// Default state factory (fresh install)
export function createDefaultState(): AppState {
  const defaultView: View = {
    id: 'view-1',
    name: 'Dashboard',
    income: [],
    expenses: [],
    taxAllocationRate: 30,
  };

  return {
    schemaVersion: 1,
    views: [defaultView],
    activeViewId: 'view-1',
  };
}

