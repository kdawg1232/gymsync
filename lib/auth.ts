import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
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

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

export async function signInWithGoogle() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      'Google Sign In is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env file.',
    );
  }

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'gymsync' });
  const nonce = Math.random().toString(36).substring(2);
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    nonce,
  );

  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  };

  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    responseType: AuthSession.ResponseType.IdToken,
    extraParams: { nonce: hashedNonce },
  });

  const result = await request.promptAsync(discovery);

  if (result.type !== 'success' || !result.params.id_token) {
    throw new Error('Google Sign In was cancelled or failed.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: result.params.id_token,
    nonce,
  });

  if (error) throw error;
  return data;
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
