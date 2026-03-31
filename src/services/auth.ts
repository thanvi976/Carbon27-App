import { supabase } from './supabase'
import { useAuthStore } from '../store/authStore'
import { getUser, upsertUser } from './db'
import type { CarbonUser } from '../types'

export async function loginEmailPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)

  const user = data.user
  let profile = await getUser(user.id)
  if (!profile) {
    profile = {
      uid: user.id,
      name: user.user_metadata?.name ?? email.split('@')[0],
      email: user.email ?? '',
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
    } as CarbonUser
    await upsertUser(user.id, profile)
  }
  useAuthStore.getState().setUser(profile)
  return data
}

export async function signupEmailPassword(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw new Error(error.message)

  const user = data.user
  if (user) {
    const profile: CarbonUser = {
      uid: user.id,
      name,
      email,
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
    }
    await upsertUser(user.id, profile)
    useAuthStore.getState().setUser(profile)
  }
  return data
}

export async function logoutUser() {
  await supabase.auth.signOut()
  useAuthStore.getState().setUser(null)
}