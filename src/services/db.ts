import { supabase } from './supabase'
import type { CarbonUser } from '../types'
import type { LevelName } from '../constants/levels'

export async function upsertUser(uid: string, data: any) {
  const { error } = await supabase
    .from('users')
    .upsert({ id: uid, ...data, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
}

export async function getUser(uid: string): Promise<CarbonUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', uid)
    .single()
  if (error || !data) return null
  return { ...data, uid: data.id } as CarbonUser
}

export async function recordAssessment(params: {
  uid: string
  score: number
  level: LevelName
  badges: CarbonUser['badges']
  responses: CarbonUser['responses']
}) {
  const { data, error } = await supabase
    .from('responses')
    .insert({
      user_id: params.uid,
      answers: params.responses,
      score: params.score,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return { id: data.id, createdAt: data.created_at }
}

export async function getLatestAssessments(uid: string, count = 20) {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(count)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getStreaks(uid: string) {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function upsertStreak(
  uid: string,
  activityName: string,
  updates: {
    current_streak: number
    longest_streak: number
    last_logged_date: string | null
  }
) {
  const { error } = await supabase
    .from('streaks')
    .upsert(
      {
        user_id: uid,
        activity_name: activityName,
        current_streak: updates.current_streak,
        longest_streak: updates.longest_streak,
        last_logged_date: updates.last_logged_date,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,activity_name' }
    )
  if (error) throw new Error(error.message)
}

export async function deleteStreak(uid: string, activityName: string) {
  const { error } = await supabase
    .from('streaks')
    .delete()
    .eq('user_id', uid)
    .eq('activity_name', activityName)
  if (error) throw new Error(error.message)
}

export async function insertStreak(uid: string, activityName: string) {
  const { error } = await supabase.from('streaks').insert({
    user_id: uid,
    activity_name: activityName,
    current_streak: 0,
    longest_streak: 0,
    last_logged_date: null,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}

export async function updateStreak(
  id: string,
  updates: {
    current_streak: number
    longest_streak: number
    last_logged_date: string | null
  }
) {
  const { error } = await supabase
    .from('streaks')
    .update({
      current_streak: updates.current_streak,
      longest_streak: updates.longest_streak,
      last_logged_date: updates.last_logged_date,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function renameStreak(id: string, newActivityName: string) {
  const { error } = await supabase
    .from('streaks')
    .update({ activity_name: newActivityName })
    .eq('id', id)
  if (error) throw new Error(error.message)
}