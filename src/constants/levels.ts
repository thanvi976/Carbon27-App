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

