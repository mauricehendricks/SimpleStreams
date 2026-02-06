import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { assignColorsToStreamsWithFallback } from '../utils/colorAssignment';
import { APP_STORAGE_KEY } from '../utils/constants';
import { createDefaultState } from './defaultState';
import { migrateState } from './migrations';
import { AppState, Stream, View } from './types';

interface SimpleStreamsState extends AppState {
  // Actions
  setActiveView: (viewId: string) => void;
  addIncomeStream: (stream: Stream) => void;
  deleteIncomeStream: (streamId: string) => void;
  addExpenseStream: (stream: Stream) => void;
  deleteExpenseStream: (streamId: string) => void;
  updateIncomeStream: (streamId: string, stream: Stream) => void;
  updateExpenseStream: (streamId: string, stream: Stream) => void;
  setTaxAllocationRate: (percent: number) => void;
  addView: (name: string) => void;
  updateView: (viewId: string, name: string) => void;
  deleteView: (viewId: string) => void;
  resetAllDataToDefaults: () => void;
  
  // Helpers
  getActiveView: () => View | null;
}

export const useSimpleStreamsStore = create<SimpleStreamsState>()(
  persist(
    (set, get) => ({
      ...createDefaultState(),

      getActiveView: () => {
        const state = get();
        return (
          state.views.find((v) => v.id === state.activeViewId) || null
        );
      },

      setActiveView: (viewId: string) => {
        set((state) => {
          const view = state.views.find((v) => v.id === viewId);
          if (!view) return state;
          return {
            ...state,
            activeViewId: viewId,
          };
        });
      },

      addIncomeStream: (stream: Stream) => {
        set((state) => {
          const view = state.views.find((v) => v.id === state.activeViewId);
          if (!view) return state;

          // Auto-assign color based on value rank
          const allStreams = [...view.income, stream];
          const updatedStreams = assignColorsToStreamsWithFallback(allStreams, 'income', false);

          return {
            ...state,
            views: state.views.map((v) =>
              v.id === state.activeViewId
                ? { ...v, income: updatedStreams }
                : v
            ),
          };
        });
      },

      deleteIncomeStream: (streamId: string) => {
        set((state) => {
          const view = state.views.find((v) => v.id === state.activeViewId);
          if (!view) return state;

          // Remove stream and re-assign colors
          const remainingStreams = view.income.filter((st) => st.id !== streamId);
          const finalStreams = assignColorsToStreamsWithFallback(remainingStreams, 'income', false);

          return {
            ...state,
            views: state.views.map((v) =>
              v.id === state.activeViewId
                ? { ...v, income: finalStreams }
                : v
            ),
          };
        });
      },

      addExpenseStream: (stream: Stream) => {
        set((state) => {
          const view = state.views.find((v) => v.id === state.activeViewId);
          if (!view) return state;

          // Auto-assign color based on value rank
          const allStreams = [...view.expenses, stream];
          const updatedStreams = assignColorsToStreamsWithFallback(allStreams, 'expense', false);

          return {
            ...state,
            views: state.views.map((v) =>
              v.id === state.activeViewId
                ? { ...v, expenses: updatedStreams }
                : v
            ),
          };
        });
      },

      deleteExpenseStream: (streamId: string) => {
        set((state) => {
          const view = state.views.find((v) => v.id === state.activeViewId);
          if (!view) return state;

          // Remove stream and re-assign colors
          const remainingStreams = view.expenses.filter(
            (st) => st.id !== streamId
          );
          const finalStreams = assignColorsToStreamsWithFallback(remainingStreams, 'expense', false);

          return {
            ...state,
            views: state.views.map((v) =>
              v.id === state.activeViewId
                ? { ...v, expenses: finalStreams }
                : v
            ),
          };
        });
      },

      updateIncomeStream: (streamId: string, stream: Stream) => {
        set((state) => {
          const view = state.views.find((v) => v.id === state.activeViewId);
          if (!view) return state;

          // Update stream and re-assign colors based on new values
          const updatedStreams = view.income.map((st) =>
            st.id === streamId ? stream : st
          );
          const finalStreams = assignColorsToStreamsWithFallback(updatedStreams, 'income', true);

          return {
            ...state,
            views: state.views.map((v) =>
              v.id === state.activeViewId
                ? { ...v, income: finalStreams }
                : v
            ),
          };
        });
      },

      updateExpenseStream: (streamId: string, stream: Stream) => {
        set((state) => {
          const view = state.views.find((v) => v.id === state.activeViewId);
          if (!view) return state;

          // Update stream and re-assign colors based on new values
          const updatedStreams = view.expenses.map((st) =>
            st.id === streamId ? stream : st
          );
          const finalStreams = assignColorsToStreamsWithFallback(updatedStreams, 'expense', true);

          return {
            ...state,
            views: state.views.map((v) =>
              v.id === state.activeViewId
                ? { ...v, expenses: finalStreams }
                : v
            ),
          };
        });
      },

      setTaxAllocationRate: (percent: number) => {
        const clamped = Math.max(0, Math.min(100, percent));
        set((state) => {
          const view = state.views.find((v) => v.id === state.activeViewId);
          if (!view) return state;

          return {
            ...state,
            views: state.views.map((v) =>
              v.id === state.activeViewId
                ? { ...v, taxAllocationRate: clamped }
                : v
            ),
          };
        });
      },

      addView: (name: string) => {

        const newView: View = {
          id: `view-${Date.now()}`,
          name: name.trim() || 'New View',
          income: [],
          expenses: [],
          taxAllocationRate: 30,
        };

        set((state) => ({
          ...state,
          views: [...state.views, newView],
          activeViewId: newView.id,
        }));
      },

      updateView: (viewId: string, name: string) => {
        set((state) => ({
          ...state,
          views: state.views.map((v) =>
            v.id === viewId ? { ...v, name: name.trim() || v.name } : v
          ),
        }));
      },

      deleteView: (viewId: string) => {
        set((state) => {
          // Don't allow deleting the last view
          if (state.views.length <= 1) {
            return state;
          }

          const remainingViews = state.views.filter((v) => v.id !== viewId);

          // If deleting the active view, switch to the first remaining view
          const newActiveViewId =
            state.activeViewId === viewId
              ? remainingViews[0]?.id || state.activeViewId
              : state.activeViewId;

          return {
            ...state,
            views: remainingViews,
            activeViewId: newActiveViewId,
          };
        });
      },

      resetAllDataToDefaults: () => {
        set(createDefaultState());
      },
    }),
    {
      name: APP_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1, // Match CURRENT_SCHEMA_VERSION
      skipHydration: true, // We handle hydration manually via useHydrationGate
      migrate: (persistedState: any, version: number) => {
        // Zustand persist handles versioning, but we also run our migration
        // This migrate function is called by Zustand when version changes
        // We use our own migrateState function which handles all cases
        const migrated = migrateState(persistedState);
        return migrated || createDefaultState();
      },
    }
  )
);
