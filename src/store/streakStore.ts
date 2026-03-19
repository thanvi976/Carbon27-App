import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hoursSince, isoNow } from '../utils/dateHelpers';

type StreakState = {
  streakCount: number;
  bestStreak: number;
  lastCheckIn: string | null;
  checkInDates: string[]; // ISO dates (YYYY-MM-DD) for calendar dots
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  checkIn: () => { streakCount: number; bestStreak: number; milestone: number | null };
  reset: () => void;
};

const MILESTONES = new Set([3, 7, 14, 30]);

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      streakCount: 0,
      bestStreak: 0,
      lastCheckIn: null,
      checkInDates: [],
      notificationsEnabled: false,
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      checkIn: () => {
        const nowIso = isoNow();
        const today = nowIso.slice(0, 10);
        const { lastCheckIn, streakCount, bestStreak } = get();
        let nextStreak = streakCount;

        if (!lastCheckIn) {
          nextStreak = 1;
        } else {
          const gapHours = hoursSince(lastCheckIn);
          if (gapHours > 24) {
            nextStreak = 1;
          } else {
            // Increment at most once per calendar day (local time)
            const last = new Date(lastCheckIn);
            const now = new Date(nowIso);
            const sameDay =
              last.getFullYear() === now.getFullYear() &&
              last.getMonth() === now.getMonth() &&
              last.getDate() === now.getDate();
            nextStreak = sameDay ? streakCount : streakCount + 1;
          }
        }

        const nextBest = Math.max(bestStreak, nextStreak);
        const milestone = MILESTONES.has(nextStreak) ? nextStreak : null;
        set((s) => ({
          streakCount: nextStreak,
          bestStreak: nextBest,
          lastCheckIn: nowIso,
          checkInDates: s.checkInDates.includes(today) ? s.checkInDates : [...s.checkInDates, today].slice(-400),
        }));
        return { streakCount: nextStreak, bestStreak: nextBest, milestone };
      },
      reset: () => set({ streakCount: 0, bestStreak: 0, lastCheckIn: null, checkInDates: [], notificationsEnabled: false }),
    }),
    { name: 'carbon27_streak', storage: createJSONStorage(() => AsyncStorage) }
  )
);

