import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Mail, Lock, ChevronLeft } from 'lucide-react-native';
import { signIn, signInWithApple, signInWithGoogle } from '@/lib/auth';
import { Colors } from '@/constants/colors';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'apple' | 'google' | null>(null);

  const canSignIn = email.includes('@') && password.length >= 6;

  const handleSignIn = async () => {
    if (!canSignIn) return;
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Sign In Failed', e.message ?? 'Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setOauthLoading('apple');
    try {
      await signInWithApple();
      router.replace('/');
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Sign In Failed', e.message ?? 'Please try again.');
      }
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGoogle = async () => {
    setOauthLoading('google');
    try {
      await signInWithGoogle();
      router.replace('/');
    } catch (e: any) {
      if (e.message?.includes('cancelled')) return;
      Alert.alert('Google Sign In Failed', e.message ?? 'Please try again.');
    } finally {
      setOauthLoading(null);
    }
  };

  const isDisabled = loading || !!oauthLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0A0A0A]"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          className="flex-1 px-6"
        >
          {/* Header */}
          <View className="pt-14 pb-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center -ml-2"
            >
              <ChevronLeft size={24} color="rgba(255,255,255,0.6)" />
            </Pressable>
          </View>

          <View className="flex-1 max-w-sm w-full self-center">
            <Text className="text-4xl font-black text-white mb-2">
              Welcome back.
            </Text>
            <Text className="text-white/50 text-base mb-10">
              Sign in to pick up where you left off.
            </Text>

            {/* OAuth Buttons */}
            <View className="gap-3 mb-8">
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
                    {oauthLoading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
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
                  {oauthLoading === 'google' ? 'Signing in...' : 'Continue with Google'}
                </Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-4 mb-8">
              <View className="flex-1 h-px bg-white/10" />
              <Text className="text-white/30 text-xs font-bold uppercase tracking-widest">
                or continue with email
              </Text>
              <View className="flex-1 h-px bg-white/10" />
            </View>

            {/* Email & Password */}
            <View className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5 gap-4 mb-6">
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
                  placeholder="Your password"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  secureTextEntry
                  className="text-lg font-medium text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10"
                />
              </View>
            </View>

            <Pressable
              onPress={handleSignIn}
              disabled={!canSignIn || isDisabled}
              className={`w-full bg-white py-4 rounded-2xl items-center active:opacity-80 flex-row justify-center gap-2 ${
                (!canSignIn || isDisabled) ? 'opacity-50' : ''
              }`}
            >
              {loading && <ActivityIndicator color="#000" size="small" />}
              <Text className="text-black font-bold text-lg">
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </Pressable>

            {/* Back to onboarding */}
            <Pressable
              onPress={() => router.back()}
              className="mt-6 py-4 items-center"
            >
              <Text className="text-white/40 text-sm">
                Don't have an account?{' '}
                <Text className="text-pastel-orange font-bold">Get started</Text>
              </Text>
            </Pressable>
          </View>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
