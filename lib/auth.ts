import { supabase } from './supabase';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function signUp(email: string, password: string, name: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Sign up failed — no user returned');

  let profileInserted = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      name,
      invite_code: generateInviteCode(),
    });

    if (!profileError) {
      profileInserted = true;
      break;
    }
    if (profileError.code !== '23505') throw profileError;
  }
  if (!profileInserted) throw new Error('Could not generate a unique invite code.');

  const { error: prefsError } = await supabase
    .from('notification_preferences')
    .insert({ user_id: authData.user.id });

  if (prefsError) throw prefsError;

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(
  callback: (session: Awaited<ReturnType<typeof getSession>>) => void,
) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
