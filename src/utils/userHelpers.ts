import type { CarbonUser } from '../types';

/** Ensure persisted/partial profiles include `streaks` and other defaults. */
export function normalizeCarbonUser(u: CarbonUser): CarbonUser {
  return {
    ...u,
    streaks: u.streaks ?? [],
  };
}
