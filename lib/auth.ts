import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Email / Password ──

export async function signUp(email: string, password: string, name: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Sign up failed — no user returned');

  await createProfileForUser(authData.user.id, name);
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

// ── Apple Sign In ──

export async function signInWithApple() {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign In is only available on iOS.');
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple Sign In failed — no identity token returned.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) throw error;
  return { data, fullName: credential.fullName };
}

// ── Google Sign In ──

export async function signInWithGoogle() {
  const redirectTo = 'gymsync://google-auth';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('No URL returned from Supabase.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, 'gymsync://');

  if (result.type !== 'success') {
    throw new Error('Google Sign In was cancelled.');
  }

  const hashIndex = result.url.indexOf('#');
  if (hashIndex === -1) throw new Error('No session data returned.');

  const params = new URLSearchParams(result.url.substring(hashIndex + 1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  if (!access_token || !refresh_token) {
    throw new Error('Missing tokens from Google Sign In response.');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (sessionError) throw sessionError;
}

// ── Profile creation (shared by email sign-up and OAuth) ──

export async function createProfileForUser(userId: string, name: string) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return;

  let profileInserted = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
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
    .insert({ user_id: userId });

  if (prefsError) throw prefsError;
}

// ── Helpers ──

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
