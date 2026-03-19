import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

export function useScore() {
  const user = useAuthStore((s) => s.user);
  return useMemo(
    () => ({
      score: user?.score ?? 0,
      level: user?.level ?? 'Carbon Rookie',
      badges: user?.badges ?? [],
    }),
    [user?.badges, user?.level, user?.score]
  );
}

