import { useAuthStore } from '../store/authStore';
import type { CarbonUser } from '../types';

function mockProfile(uid: string, name: string, email: string): CarbonUser {
  return {
    uid,
    name: name.trim() || email.split('@')[0] || 'Member',
    email: email.trim(),
    photoURL: null,
    score: 0,
    level: 'Carbon Rookie',
    badges: [],
    responses: {},
    streakCount: 0,
    bestStreak: 0,
    lastCheckIn: null,
    lastAssessmentDate: null,
    scoreHistory: [],
    certificateId: null,
    orgId: null,
    streaks: [],
  };
}

export async function loginEmailPassword(email: string, password: string) {
  // Mock login - will be replaced with real Firebase Auth in dev build
  const uid = 'mock-uid-123';
  const profile = mockProfile(uid, email.split('@')[0] || 'Member', email);
  useAuthStore.getState().setUser(profile);
  return { uid, email, displayName: profile.name };
}

export async function signupEmailPassword(name: string, email: string, password: string) {
  // Mock signup - will be replaced with real Firebase Auth in dev build
  const uid = 'mock-uid-123';
  const profile = mockProfile(uid, name, email);
  useAuthStore.getState().setUser(profile);
  return { uid, email, displayName: profile.name };
}
export async function logoutUser() {
  useAuthStore.getState().setUser(null);
}

