import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Mail, Lock } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { signUp, signInWithApple, signInWithGoogle, createProfileForUser } from '@/lib/auth';
import { uploadAvatar } from '@/lib/storage';
import { updateProfile } from '@/lib/database';

interface Props {
  nextStep: () => void;
}

export function StepCreateAccount({ nextStep }: Props) {
  const { user, onboardingName, onboardingAvatarUri, refreshProfile } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'apple' | 'google' | null>(null);

  const canSignUp = email.includes('@') && password.length >= 6;
  const isDisabled = loading || !!oauthLoading;
  const didAutoAdvance = useRef(false);

  useEffect(() => {
    if (user && !didAutoAdvance.current) {
      didAutoAdvance.current = true;
      (async () => {
        try {
          await createProfileForUser(user.id, onboardingName.trim() || 'User');
          await finalizeProfile(user.id);
        } catch (e) {
          console.warn('Auto profile creation failed:', e);
        }
        nextStep();
      })();
    }
  }, [user]);

  const finalizeProfile = async (userId: string) => {
    if (onboardingAvatarUri) {
      try {
        const url = await uploadAvatar(userId, onboardingAvatarUri);
        await updateProfile(userId, { avatar_url: url });
      } catch (e) {
        console.warn('Avatar upload failed, continuing:', e);
      }
    }
    await refreshProfile();
  };

  const handleSignUp = async () => {
    if (!canSignUp) return;
    setLoading(true);
    try {
      const authData = await signUp(
        email.trim().toLowerCase(),
        password,
        onboardingName.trim(),
      );
      if (authData.user) {
        await finalizeProfile(authData.user.id);
      }
      nextStep();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setOauthLoading('apple');
    try {
      const { data, fullName } = await signInWithApple();
      if (data.user) {
        const displayName =
          onboardingName.trim() ||
          [fullName?.givenName, fullName?.familyName].filter(Boolean).join(' ') ||
          'User';
        await createProfileForUser(data.user.id, displayName);
        await finalizeProfile(data.user.id);
      }
      nextStep();
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Sign Up Failed', e.message ?? 'Please try again.');
      }
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGoogle = async () => {
    setOauthLoading('google');
    try {
      const data = await signInWithGoogle();
      if (data.user) {
        const displayName = onboardingName.trim() || data.user.user_metadata?.full_name || 'User';
        await createProfileForUser(data.user.id, displayName);
        await finalizeProfile(data.user.id);
      }
      nextStep();
    } catch (e: any) {
      if (e.message?.includes('cancelled')) return;
      Alert.alert('Google Sign Up Failed', e.message ?? 'Please try again.');
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 items-center pt-10 w-full">
        <View className="flex-1 w-full max-w-sm justify-start px-4">
          <Text className="text-3xl font-black text-white text-center mb-2">
            Lock in your account.
          </Text>
          <Text className="text-white/50 text-center mb-8">
            Create an account so your progress is saved.
          </Text>

          {/* OAuth Buttons */}
          <View className="gap-3 mb-6">
            {Platform.OS === 'ios' && (
              <Pressable
                onPress={handleApple}
                disabled={isDisabled}
                className="w-full bg-white py-4 rounded-2xl flex-row items-center justify-center gap-3 active:opacity-80"
                style={isDisabled ? { opacity: 0.5 } : undefined}
              >
                {oauthLoading === 'apple' ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text className="text-lg">&#xF8FF;</Text>
                )}
                <Text className="text-black font-bold text-base">
                  {oauthLoading === 'apple' ? 'Creating account...' : 'Sign up with Apple'}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleGoogle}
              disabled={isDisabled}
              className="w-full bg-white/10 border border-white/10 py-4 rounded-2xl flex-row items-center justify-center gap-3 active:opacity-80"
              style={isDisabled ? { opacity: 0.5 } : undefined}
            >
              {oauthLoading === 'google' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-lg font-bold text-white">G</Text>
              )}
              <Text className="text-white font-bold text-base">
                {oauthLoading === 'google' ? 'Creating account...' : 'Sign up with Google'}
              </Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View className="flex-row items-center gap-4 mb-6">
            <View className="flex-1 h-px bg-white/10" />
            <Text className="text-white/30 text-xs font-bold uppercase tracking-widest">
              or use email
            </Text>
            <View className="flex-1 h-px bg-white/10" />
          </View>

          {/* Email & Password */}
          <View className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5 gap-4">
            <View className="absolute top-0 left-0 right-0 h-1 bg-pastel-green" />

            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Mail size={16} color="rgba(255,255,255,0.4)" />
                <Text className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Email
                </Text>
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="text-lg font-medium text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10"
              />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Lock size={16} color="rgba(255,255,255,0.4)" />
                <Text className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Password
                </Text>
              </View>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor="rgba(255,255,255,0.2)"
                secureTextEntry
                className="text-lg font-medium text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10"
              />
            </View>
          </View>
        </View>

        <View className="w-full pb-8 pt-4 max-w-sm px-4">
          <Pressable
            onPress={handleSignUp}
            disabled={!canSignUp || isDisabled}
            className={`w-full bg-pastel-green py-4 rounded-2xl items-center active:opacity-80 flex-row justify-center gap-2 ${
              (!canSignUp || isDisabled) ? 'opacity-50' : ''
            }`}
          >
            {loading && <ActivityIndicator color="#000" size="small" />}
            <Text className="text-black font-bold text-lg">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
