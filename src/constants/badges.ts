import type { BadgeId, QuizResponses } from '../types';

export const BADGES: { id: BadgeId; title: string; rule: (r: QuizResponses) => boolean }[] = [
  { id: 'water_saver', title: 'Water Saver', rule: (r) => (r.q9 ?? 0) >= 4 },
  { id: 'low_carbon_commuter', title: 'Low-Carbon Commuter', rule: (r) => (r.q1 ?? 0) >= 4 },
  { id: 'waste_warrior', title: 'Waste Warrior', rule: (r) => (r.q8 ?? 0) >= 4 },
  { id: 'conscious_eater', title: 'Conscious Eater', rule: (r) => (r.q3 ?? 0) >= 4 },
  { id: 'plastic_reducer', title: 'Plastic Reducer', rule: (r) => (r.q7 ?? 0) >= 4 },
];

export function computeBadges(responses: QuizResponses): BadgeId[] {
  return BADGES.filter((b) => b.rule(responses)).map((b) => b.id);
}

