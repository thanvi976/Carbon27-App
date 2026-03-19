import { useStreakStore } from '../store/streakStore';

export function useStreak() {
  const streakCount = useStreakStore((s) => s.streakCount);
  const bestStreak = useStreakStore((s) => s.bestStreak);
  const lastCheckIn = useStreakStore((s) => s.lastCheckIn);
  const checkInDates = useStreakStore((s) => s.checkInDates);
  const checkIn = useStreakStore((s) => s.checkIn);
  return { streakCount, bestStreak, lastCheckIn, checkInDates, checkIn };
}

