import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { assignColorsToStreams, getExpenseColor, getIncomeColor } from '../utils/colorAssignment';
import { createDefaultState } from './defaultState';
import { migrateState } from './migrations';
import { AppState, Profile, Stream, View } from './types';
import { usePremiumStore } from './usePremiumStore';

const APP_STORAGE_KEY = 'simple_streams_state_v1';

interface SimpleStreamsState extends AppState {
  // Actions
  setActiveProfile: (profileId: string) => void;
  setActiveView: (viewId: string) => void;
  addIncomeStream: (stream: Stream) => void;
  deleteIncomeStream: (streamId: string) => void;
  addExpenseStream: (stream: Stream) => void;
  deleteExpenseStream: (streamId: string) => void;
  updateIncomeStream: (streamId: string, stream: Stream) => void;
  updateExpenseStream: (streamId: string, stream: Stream) => void;
  setTaxAllocationRate: (percent: number) => void;
  addProfile: (name: string) => void;
  updateProfile: (profileId: string, name: string) => void;
  deleteProfile: (profileId: string) => void;
  addView: (name: string) => void;
  updateView: (viewId: string, name: string) => void;
  deleteView: (viewId: string) => void;
  resetAllDataToDefaults: () => void;
  
  // Helpers
  getActiveProfile: () => Profile | null;
  getActiveView: () => View | null;
}

export const useSimpleStreamsStore = create<SimpleStreamsState>()(
  persist(
    (set, get) => ({
      ...createDefaultState(),

      getActiveProfile: () => {
        const state = get();
        return (
          state.profiles.find((p) => p.id === state.activeProfileId) || null
        );
      },

      getActiveView: () => {
        const profile = get().getActiveProfile();
        if (!profile) return null;
        return (
          profile.views.find((v) => v.id === profile.activeViewId) ||
          null
        );
      },

      setActiveProfile: (profileId: string) => {
        set((state) => {
          const profile = state.profiles.find((p) => p.id === profileId);
          if (!profile) return state;
          return {
            ...state,
            activeProfileId: profileId,
          };
        });
      },

      setActiveView: (viewId: string) => {
        set((state) => {
          const profile = state.profiles.find(
            (p) => p.id === state.activeProfileId
          );
          if (!profile) return state;
          const view = profile.views.find((v) => v.id === viewId);
          if (!view) return state;
          return {
            ...state,
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? { ...p, activeViewId: viewId }
                : p
            ),
          };
        });
      },

      addIncomeStream: (stream: Stream) => {
        set((state) => {
          const profile = state.profiles.find(
            (p) => p.id === state.activeProfileId
          );
          if (!profile) return state;
          const view = profile.views.find(
            (v) => v.id === profile.activeViewId
          );
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
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    views: p.views.map((v) =>
                      v.id === profile.activeViewId
                        ? {
                            ...v,
                            income: updatedStreams,
                          }
                        : v
                    ),
                  }
                : p
            ),
          };
        });
      },

      deleteIncomeStream: (streamId: string) => {
        set((state) => {
          const profile = state.profiles.find(
            (p) => p.id === state.activeProfileId
          );
          if (!profile) return state;
          const view = profile.views.find(
            (v) => v.id === profile.activeViewId
          );
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
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    views: p.views.map((v) =>
                      v.id === profile.activeViewId
                        ? {
                            ...v,
                            income: finalStreams,
                          }
                        : v
                    ),
                  }
                : p
            ),
          };
        });
      },

      addExpenseStream: (stream: Stream) => {
        set((state) => {
          const profile = state.profiles.find(
            (p) => p.id === state.activeProfileId
          );
          if (!profile) return state;
          const view = profile.views.find(
            (v) => v.id === profile.activeViewId
          );
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
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    views: p.views.map((v) =>
                      v.id === profile.activeViewId
                        ? {
                            ...v,
                            expenses: updatedStreams,
                          }
                        : v
                    ),
                  }
                : p
            ),
          };
        });
      },

      deleteExpenseStream: (streamId: string) => {
        set((state) => {
          const profile = state.profiles.find(
            (p) => p.id === state.activeProfileId
          );
          if (!profile) return state;
          const view = profile.views.find(
            (v) => v.id === profile.activeViewId
          );
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
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    views: p.views.map((v) =>
                      v.id === profile.activeViewId
                        ? {
                            ...v,
                            expenses: finalStreams,
                          }
                        : v
                    ),
                  }
                : p
            ),
          };
        });
      },

      updateIncomeStream: (streamId: string, stream: Stream) => {
        set((state) => {
          const profile = state.profiles.find(
            (p) => p.id === state.activeProfileId
          );
          if (!profile) return state;
          const view = profile.views.find(
            (v) => v.id === profile.activeViewId
          );
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
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    views: p.views.map((v) =>
                      v.id === profile.activeViewId
                        ? {
                            ...v,
                            income: finalStreams,
                          }
                        : v
                    ),
                  }
                : p
            ),
          };
        });
      },

      updateExpenseStream: (streamId: string, stream: Stream) => {
        set((state) => {
          const profile = state.profiles.find(
            (p) => p.id === state.activeProfileId
          );
          if (!profile) return state;
          const view = profile.views.find(
            (v) => v.id === profile.activeViewId
          );
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
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    views: p.views.map((v) =>
                      v.id === profile.activeViewId
                        ? {
                            ...v,
                            expenses: finalStreams,
                          }
                        : v
                    ),
                  }
                : p
            ),
          };
        });
      },

      setTaxAllocationRate: (percent: number) => {
        const clamped = Math.max(0, Math.min(100, percent));
        set((state) => {
          const profile = state.profiles.find(
            (p) => p.id === state.activeProfileId
          );
          if (!profile) return state;

          return {
            ...state,
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    views: p.views.map((v) =>
                      v.id === profile.activeViewId
                        ? { ...v, taxAllocationRate: clamped }
                        : v
                    ),
                  }
                : p
            ),
          };
        });
      },

      addProfile: (name: string) => {
        const isPremium = usePremiumStore.getState().isPremium;
        if (!isPremium && get().profiles.length >= 1) {
          // Premium gate: only allow 1 profile in free tier
          return;
        }

        const newProfile: Profile = {
          id: `profile-${Date.now()}`,
          name: name.trim() || 'New Profile',
          views: [
            {
              id: `view-${Date.now()}`,
              name: 'View',
              income: [],
              expenses: [],
              taxAllocationRate: 30,
            },
          ],
          activeViewId: `view-${Date.now()}`,
        };

        set((state) => ({
          ...state,
          profiles: [...state.profiles, newProfile],
          activeProfileId: newProfile.id,
        }));
      },

      updateProfile: (profileId: string, name: string) => {
        set((state) => ({
          ...state,
          profiles: state.profiles.map((p) =>
            p.id === profileId ? { ...p, name: name.trim() || p.name } : p
          ),
        }));
      },

      deleteProfile: (profileId: string) => {
        set((state) => {
          // Don't allow deleting the last profile
          if (state.profiles.length <= 1) {
            return state;
          }

          const remainingProfiles = state.profiles.filter(
            (p) => p.id !== profileId
          );

          // If deleting the active profile, switch to the first remaining profile
          const newActiveProfileId =
            state.activeProfileId === profileId
              ? remainingProfiles[0]?.id || state.activeProfileId
              : state.activeProfileId;

          return {
            ...state,
            profiles: remainingProfiles,
            activeProfileId: newActiveProfileId,
          };
        });
      },

      addView: (name: string) => {
        const isPremium = usePremiumStore.getState().isPremium;
        const profile = get().getActiveProfile();
        if (!profile) return;

        if (!isPremium && profile.views.length >= 1) {
          // Premium gate: only allow 1 view per profile in free tier
          return;
        }

        const newView: View = {
          id: `view-${Date.now()}`,
          name: name.trim() || 'New View',
          income: [],
          expenses: [],
          taxAllocationRate: 30,
        };

        set((state) => {
          const profile = state.profiles.find(
            (p) => p.id === state.activeProfileId
          );
          if (!profile) return state;

          return {
            ...state,
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    views: [...p.views, newView],
                    activeViewId: newView.id,
                  }
                : p
            ),
          };
        });
      },

      updateView: (viewId: string, name: string) => {
        set((state) => {
          const profile = state.profiles.find(
            (p) => p.id === state.activeProfileId
          );
          if (!profile) return state;

          return {
            ...state,
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    views: p.views.map((v) =>
                      v.id === viewId
                        ? { ...v, name: name.trim() || v.name }
                        : v
                    ),
                  }
                : p
            ),
          };
        });
      },

      deleteView: (viewId: string) => {
        set((state) => {
          const profile = state.profiles.find(
            (p) => p.id === state.activeProfileId
          );
          if (!profile) return state;

          // Don't allow deleting the last view
          if (profile.views.length <= 1) {
            return state;
          }

          const remainingViews = profile.views.filter((v) => v.id !== viewId);

          // If deleting the active view, switch to the first remaining view
          const newActiveViewId =
            profile.activeViewId === viewId
              ? remainingViews[0]?.id || profile.activeViewId
              : profile.activeViewId;

          return {
            ...state,
            profiles: state.profiles.map((p) =>
              p.id === state.activeProfileId
                ? {
                    ...p,
                    views: remainingViews,
                    activeViewId: newActiveViewId,
                  }
                : p
            ),
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
      version: 2, // Match CURRENT_SCHEMA_VERSION
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
