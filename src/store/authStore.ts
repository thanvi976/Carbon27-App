import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CarbonUser } from '../types';

type AuthState = {
  user: CarbonUser | null;
  setUser: (user: CarbonUser | null) => void;
  /** Immutable-style update when signed in; no-op if logged out. */
  updateUser: (fn: (prev: CarbonUser) => CarbonUser) => void;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (fn) =>
        set((s) => {
          if (!s.user) return s;
          return { user: fn(s.user) };
        }),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: 'carbon27_auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

