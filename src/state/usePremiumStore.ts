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
    set({ isPremium: value });
    try {
      await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save premium status:', error);
    }
  },
  loadPremium: async () => {
    try {
      const stored = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
      if (stored !== null) {
        const value = JSON.parse(stored);
        set({ isPremium: value === true || value === 'true' });
      }
    } catch (error) {
      console.error('Failed to load premium status:', error);
      set({ isPremium: false });
    }
  },
}));
