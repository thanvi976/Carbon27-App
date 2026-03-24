import type { LevelName } from '../constants/levels';

export type QuestionId =
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'q5'
  | 'q6'
  | 'q7'
  | 'q8'
  | 'q9'
  | 'q10'
  | 'q11'
  | 'q12'
  | 'q13'
  | 'q14'
  | 'q15';

export type QuizResponses = Partial<Record<QuestionId, number>>;

export type BadgeId =
  | 'water_saver'
  | 'low_carbon_commuter'
  | 'waste_warrior'
  | 'conscious_eater'
  | 'plastic_reducer';

export type QuestionOption = { label: string; value: number };
export type Question = { id: QuestionId; text: string; options: QuestionOption[] };

/** Per-activity streak row (mirrors website streak model). */
export type UserStreak = {
  id: string;
  activityName: string;
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null;
};

export type CarbonUser = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string | null;
  score: number;
  level: LevelName;
  badges: BadgeId[];
  responses: QuizResponses;
  streakCount: number;
  bestStreak: number;
  lastCheckIn: string | null; // ISO
  lastAssessmentDate: string | null; // ISO
  scoreHistory: { date: string; score: number }[];
  certificateId: string | null;
  orgId: string | null;
  /** Activity streaks; defaults to [] when missing from storage. */
  streaks?: UserStreak[];
  createdAt?: string;
};

export type Organisation = {
  id: string;
  name: string;
  adminUid: string;
  members: string[];
  inviteCode: string;
  createdAt?: string;
};

export type Assessment = {
  id: string;
  uid: string;
  score: number;
  level: LevelName;
  badges: BadgeId[];
  responses: QuizResponses;
  createdAt: string;
};

export type Loadable<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  offline: boolean;
};

