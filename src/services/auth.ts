import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { supabase } from './supabase'
import { useAuthStore } from '../store/authStore'
import { getUser, upsertUser } from './db'
import type { CarbonUser } from '../types'

WebBrowser.maybeCompleteAuthSession()

export type SignupExtraData = {
  account_type: 'personal' | 'organization'
  organization_name?: string | null
  organization_address?: string | null
  organization_email?: string | null
  organization_size?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
}

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

export async function sendOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })
  if (error) throw new Error(error.message)
}

export async function verifyOtp(email: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
  if (error) throw new Error(error.message)
}

export async function setPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
}

export async function finishSignup(
  name: string,
  extraData: SignupExtraData,
  onDone: () => void
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No authenticated user found.')

  await upsertUser(user.id, {
    email: user.email,
    name: name.trim(),
    score: null,
    level: null,
    account_type: extraData.account_type,
    organization_name: extraData.organization_name ?? null,
    organization_address: extraData.organization_address ?? null,
    organization_email: extraData.organization_email ?? null,
    organization_size: extraData.organization_size ?? null,
    contact_name: extraData.contact_name ?? null,
    contact_email: extraData.contact_email ?? null,
    contact_phone: extraData.contact_phone ?? null,
  })

  await supabase.auth.updateUser({ data: { name: name.trim() } })

  const profile = await getUser(user.id)
  if (!profile) throw new Error('Could not load profile after signup.')

  useAuthStore.getState().setUser(profile)
  onDone()
}

export async function logoutUser() {
  await supabase.auth.signOut()
  useAuthStore.getState().setUser(null)
}

export async function signInWithGoogle(): Promise<{ isNewUser: boolean; googleName: string }> {
  const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'carbon27', path: 'auth/callback' })

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  })

  if (error) throw new Error(error.message)
  if (!data?.url) throw new Error('No OAuth URL returned')

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl)

  if (result.type !== 'success') throw new Error('Google sign-in was cancelled or failed')

  const url = result.url
  const fragment = url.split('#')[1] ?? url.split('?')[1] ?? ''
  const paramEntries = Object.fromEntries(
    fragment.split('&').map((pair) => pair.split('=').map(decodeURIComponent) as [string, string])
  )
  const accessToken = paramEntries['access_token'] ?? null
  const refreshToken = paramEntries['refresh_token'] ?? null

  if (!accessToken) throw new Error('No access token returned from Google')

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken ?? '',
  })

  if (sessionError) throw new Error(sessionError.message)

  const user = sessionData.session?.user
  if (!user) throw new Error('No user in session')

  const googleName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'User'

  const profile = await getUser(user.id)

  if (profile) {
    // Existing user — load into store; RootNavigator switches automatically
    useAuthStore.getState().setUser(profile)
    return { isNewUser: false, googleName }
  }

  // New user — session is live but no profile yet; caller handles navigation to profile setup
  return { isNewUser: true, googleName }
}