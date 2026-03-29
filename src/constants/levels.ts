export type LevelName =
  | 'Planet Hero'
  | 'Green Champion'
  | 'Eco Learner'
  | 'Climate Explorer'
  | 'Carbon Rookie';

export function scoreToLevel(score: number): LevelName {
  if (score >= 81) return 'Planet Hero';
  if (score >= 61) return 'Green Champion';
  if (score >= 41) return 'Eco Learner';
  if (score >= 21) return 'Climate Explorer';
  return 'Carbon Rookie';
}

/** Level label from numeric sustainability score (0–100). */
export function getLevel(score: number): LevelName {
  return scoreToLevel(score);
}

/** Sustainability badge title derived from score tier (for profile/certificate UI). */
export function getBadge(score: number): string {
  if (score >= 81) return 'Carbon Champion';
  if (score >= 61) return 'Eco Positive';
  if (score >= 41) return 'Climate Aware';
  if (score >= 21) return 'Needs Improvement';
  return 'High Impact';
}



