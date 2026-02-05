import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const PREMIUM_STORAGE_KEY = 'simple_streams_premium_v1';

interface PremiumState {
  isPremium: boolean;
  setIsPremium: (value: boolean) => Promise<void>;
  loadPremium: () => Promise<void>;
}

export const usePremiumStore = create<PremiumState>((set) => ({
  isPremium: false,
  setIsPremium: async (value: boolean) => {
    // Force premium to always be false for now
    set({ isPremium: false });
    try {
      await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(false));
    } catch (error) {
      console.error('[Premium] Failed to save premium status:', error);
      // Continue anyway - premium status is set in memory
    }
  },
  loadPremium: async () => {
    // Force premium to always be false for now
    set({ isPremium: false });
    try {
      // Still clear any stored premium value to ensure clean state
      await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(false));
    } catch (error) {
      console.error('[Premium] Failed to load premium status:', error);
      // Default to false - never show errors to users
      set({ isPremium: false });
    }
  },
}));
