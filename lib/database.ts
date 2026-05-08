import { format, parseISO } from 'date-fns';
import { supabase } from './supabase';
import type { Profile, Pact, WorkoutLog, NotificationPreference } from '@/types';

// ── Profiles ──

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'name' | 'avatar_url' | 'partner_id' | 'notification_token'>>,
) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

export async function clearMyData() {
  const { error } = await supabase.rpc('clear_user_data');
  if (error) throw error;
}

export async function deleteMyAccount() {
  const { error } = await supabase.rpc('delete_user_account');
  if (error) throw error;
}

export async function getProfileByInviteCode(code: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('invite_code', code.toUpperCase())
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ── Pacts ──

export async function getActivePact(userId: string): Promise<Pact | null> {
  const { data, error } = await supabase
    .from('pacts')
    .select('*')
    .eq('active', true)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createPact(
  user1Id: string,
  user2Id: string,
  goal: number,
  wager: string,
): Promise<Pact> {
  const { data, error } = await supabase
    .from('pacts')
    .insert({ user1_id: user1Id, user2_id: user2Id, goal, wager })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePact(
  pactId: string,
  updates: Partial<Pick<Pact, 'goal' | 'wager' | 'user1_debt' | 'user2_debt' | 'active'>>,
) {
  const { error } = await supabase
    .from('pacts')
    .update(updates)
    .eq('id', pactId);
  if (error) throw error;
}

// ── Partner Pairing ──

export async function pairPartner(myId: string, partnerId: string, goal: number, wager: string) {
  const { error: rpcError } = await supabase.rpc('pair_partners', {
    p_my_id: myId,
    p_partner_id: partnerId,
  });
  if (rpcError) throw rpcError;

  const existingPact = await getActivePact(myId);
  if (existingPact) {
    await updatePact(existingPact.id, { active: false });
  }

  return createPact(myId, partnerId, goal, wager);
}

export async function unpairPartners(userId: string) {
  const { error } = await supabase.rpc('unpair_partners', { p_user_id: userId });
  if (error) throw error;
}

// ── Workout Logs ──

export async function addWorkoutLog(log: {
  user_id: string;
  pact_id: string | null;
  image_url: string | null;
  caption: string | null;
  mood: string;
}): Promise<WorkoutLog> {
  const { data, error } = await supabase
    .from('workout_logs')
    .insert(log)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getWorkoutLogs(
  userId: string,
  partnerId: string | null,
  options?: { weekStart?: string; limit?: number; from?: string; to?: string },
): Promise<WorkoutLog[]> {
  let query = supabase
    .from('workout_logs')
    .select('*')
    .order('logged_at', { ascending: false });

  const userIds = [userId];
  if (partnerId) userIds.push(partnerId);
  query = query.in('user_id', userIds);

  if (options?.weekStart) {
    query = query.gte('logged_at', options.weekStart);
  }
  if (options?.from) {
    query = query.gte('logged_at', options.from);
  }
  if (options?.to) {
    query = query.lt('logged_at', options.to);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getWorkoutLogsByUser(
  userId: string,
  options?: { limit?: number },
): Promise<WorkoutLog[]> {
  let query = supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getTodayLog(userId: string): Promise<WorkoutLog | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', today.toISOString())
    .lt('logged_at', tomorrow.toISOString())
    .order('logged_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateWorkoutLog(
  logId: string,
  updates: Partial<Pick<WorkoutLog, 'image_url' | 'caption' | 'mood'>>,
) {
  const { error } = await supabase
    .from('workout_logs')
    .update(updates)
    .eq('id', logId);
  if (error) throw error;
}

// ── Streak Calculation ──

export async function getWeeklyStreak(userId: string, goal: number): Promise<number> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('logged_at, image_url')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false });

  if (error || !data?.length) return 0;

  const now = new Date();
  let streak = 0;

  const getWeekStart = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const ws = new Date(d);
    ws.setDate(diff);
    ws.setHours(0, 0, 0, 0);
    return ws;
  };

  let weekStart = getWeekStart(now);

  while (true) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const photoDaysInWeek = new Set(
      data
        .filter((l) => {
          if (!l.image_url) return false;
          const d = parseISO(l.logged_at);
          return d >= weekStart && d < weekEnd;
        })
        .map((l) => format(parseISO(l.logged_at), 'yyyy-MM-dd')),
    );

    if (photoDaysInWeek.size >= goal) {
      streak++;
      weekStart = new Date(weekStart);
      weekStart.setDate(weekStart.getDate() - 7);
    } else {
      break;
    }
  }

  return streak;
}

// ── Notification Preferences ──

export async function getNotificationPrefs(
  userId: string,
): Promise<NotificationPreference | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateNotificationPrefs(
  userId: string,
  updates: Partial<
    Pick<
      NotificationPreference,
      'workout_reminders' | 'partner_activity' | 'weekly_summary' | 'reminder_time'
    >
  >,
) {
  const { error } = await supabase
    .from('notification_preferences')
    .update(updates)
    .eq('user_id', userId);
  if (error) throw error;
}
