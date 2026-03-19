import { computeBadges } from '../constants/badges';
import { scoreToLevel } from '../constants/levels';
import type { BadgeId, QuizResponses } from '../types';

export function sumPoints(responses: QuizResponses): number {
  return Object.values(responses).reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);
}

export function finalScoreFromPoints(userPoints: number): number {
  return Math.round((userPoints / 75) * 100);
}

export function scoreFromResponses(responses: QuizResponses) {
  const points = sumPoints(responses);
  const score = finalScoreFromPoints(points);
  const level = scoreToLevel(score);
  const badges: BadgeId[] = computeBadges(responses);
  return { points, score, level, badges };
}

export function improvementTips(responses: QuizResponses): string[] {
  // Highest-signal tips: find the 3 lowest scoring answers and suggest an upgrade path.
  const entries = Object.entries(responses)
    .filter(([, v]) => typeof v === 'number')
    .map(([k, v]) => ({ id: k as keyof QuizResponses, value: v as number }))
    .sort((a, b) => a.value - b.value);

  const tips: string[] = [];
  for (const e of entries) {
    if (tips.length >= 3) break;
    if (e.value >= 4) continue;
    switch (e.id) {
      case 'q1':
        tips.push('Try one low-carbon commute per week—public transport, bike, or walking.');
        break;
      case 'q2':
        tips.push('Reduce flights where possible; bundle trips or choose rail for short routes.');
        break;
      case 'q3':
        tips.push('Swap one meat meal for a plant-based option a few times a week.');
        break;
      case 'q7':
        tips.push('Keep a reusable bottle/bag handy to cut single-use plastics.');
        break;
      case 'q9':
        tips.push('Aim for 5–10 minute showers to save water and energy.');
        break;
      default:
        tips.push('Pick one habit to improve this week and track it daily.');
        break;
    }
  }
  while (tips.length < 3) tips.push('Keep momentum—small changes compound over time.');
  return tips.slice(0, 3);
}

