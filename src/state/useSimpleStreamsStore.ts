import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { assignColorsToStreams, getExpenseColor, getIncomeColor } from '../utils/colorAssignment';
import { createDefaultState } from './defaultState';
import { migrateState } from './migrations';
import { AppState, Stream, View } from './types';
import { usePremiumStore } from './usePremiumStore';

const APP_STORAGE_KEY = 'simple_streams_state_v1';

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
          const streamsWithColors = assignColorsToStreams(
            allStreams.map(s => ({ amount: s.amount, id: s.id })),
            'income'
          );
          
          // Map colors back to streams
          // If there's only one stream, fallback to darkest color (rank 1), otherwise lightest (rank 0)
          const fallbackColor = allStreams.length === 1 ? getIncomeColor(1) : getIncomeColor(0);
          const updatedStreams = allStreams.map(s => {
            const colorItem = streamsWithColors.find(c => c.id === s.id);
            return { ...s, color: colorItem?.color || fallbackColor };
          });

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
          const streamsWithColors = assignColorsToStreams(
            remainingStreams.map(s => ({ amount: s.amount, id: s.id })),
            'income'
          );
          
          // Map colors back to streams
          // If there's only one stream, fallback to darkest color (rank 1), otherwise lightest (rank 0)
          const fallbackColor = remainingStreams.length === 1 ? getIncomeColor(1) : getIncomeColor(0);
          const finalStreams = remainingStreams.map(s => {
            const colorItem = streamsWithColors.find(c => c.id === s.id);
            return { ...s, color: colorItem?.color || fallbackColor };
          });

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
          const streamsWithColors = assignColorsToStreams(
            allStreams.map(s => ({ amount: s.amount, id: s.id })),
            'expense'
          );
          
          // Map colors back to streams
          // If there's only one stream, fallback to darkest color (rank 1), otherwise lightest (rank 0)
          const fallbackColor = allStreams.length === 1 ? getExpenseColor(1) : getExpenseColor(0);
          const updatedStreams = allStreams.map(s => {
            const colorItem = streamsWithColors.find(c => c.id === s.id);
            return { ...s, color: colorItem?.color || fallbackColor };
          });

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
          const streamsWithColors = assignColorsToStreams(
            remainingStreams.map(s => ({ amount: s.amount, id: s.id })),
            'expense'
          );
          
          // Map colors back to streams
          // If there's only one stream, fallback to darkest color (rank 1), otherwise lightest (rank 0)
          const fallbackColor = remainingStreams.length === 1 ? getExpenseColor(1) : getExpenseColor(0);
          const finalStreams = remainingStreams.map(s => {
            const colorItem = streamsWithColors.find(c => c.id === s.id);
            return { ...s, color: colorItem?.color || fallbackColor };
          });

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
          const streamsWithColors = assignColorsToStreams(
            updatedStreams.map(s => ({ amount: s.amount, id: s.id })),
            'income'
          );
          
          // Map colors back to streams
          const finalStreams = updatedStreams.map(s => {
            const colorItem = streamsWithColors.find(c => c.id === s.id);
            return { ...s, color: colorItem?.color || s.color };
          });

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
          const streamsWithColors = assignColorsToStreams(
            updatedStreams.map(s => ({ amount: s.amount, id: s.id })),
            'expense'
          );
          
          // Map colors back to streams
          const finalStreams = updatedStreams.map(s => {
            const colorItem = streamsWithColors.find(c => c.id === s.id);
            return { ...s, color: colorItem?.color || s.color };
          });

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
        const isPremium = usePremiumStore.getState().isPremium;
        if (!isPremium && get().views.length >= 1) {
          // Premium gate: only allow 1 view in free tier
          return;
        }

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
      version: 3, // Match CURRENT_SCHEMA_VERSION
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
