import { createClient } from '@/lib/supabase/client'
import type { UserSettings } from '@/lib/types'

export const DEFAULT_USER_SETTINGS: UserSettings = {
  email_reminders: true,
  reminder_days: [7, 3, 1],
}

export async function getSettings(userId: string): Promise<UserSettings> {
  const supabase = createClient()
  if (!supabase) return DEFAULT_USER_SETTINGS
  const { data, error } = await supabase
    .from('user_settings')
    .select('email_reminders, reminder_days')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return DEFAULT_USER_SETTINGS

  return {
    email_reminders: data.email_reminders ?? DEFAULT_USER_SETTINGS.email_reminders,
    reminder_days: data.reminder_days ?? DEFAULT_USER_SETTINGS.reminder_days,
  }
}

export async function saveSettings(
  userId: string,
  settings: UserSettings,
): Promise<void> {
  const supabase = createClient()
  if (!supabase) return
  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: userId,
      email_reminders: settings.email_reminders,
      reminder_days: settings.reminder_days,
    },
    { onConflict: 'user_id' },
  )
  if (error) throw error
}
