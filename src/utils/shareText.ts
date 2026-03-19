import type { LevelName } from '../constants/levels';

export function linkedInShareText(score: number, level: LevelName) {
  return `I just completed the Carbon27 assessment and scored ${score}/100 (${level}). Track. Reduce. Sustain. Repeat.`;
}

