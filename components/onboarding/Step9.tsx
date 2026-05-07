import { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Type, Mail, Lock } from 'lucide-react-native';
import { signUp } from '@/lib/auth';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
  name: string;
  setName: (v: string) => void;
}

export function Step9({ nextStep, name, setName }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const canProceed = name.trim().length >= 2 && email.includes('@') && password.length >= 6;

  const handleSignUp = async () => {
    if (!canProceed) return;
    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim());
      nextStep();
    } catch (e: any) {
      const msg = e.message ?? 'Sign up failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
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
            Who are you in this duo?
          </Text>
          <Text className="text-white/50 text-center mb-8">
            Create your account to get started.
          </Text>

          <View className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5 gap-4">
            <View className="absolute top-0 left-0 right-0 h-1 bg-pastel-blue" />

            {/* Name */}
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Type size={16} color="rgba(255,255,255,0.4)" />
                <Text className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Your Name
                </Text>
              </View>
              <TextInput
                autoFocus
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255,255,255,0.2)"
                className="text-xl font-bold text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10"
              />
            </View>

            {/* Email */}
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

            {/* Password */}
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
            disabled={!canProceed || loading}
            className={`w-full bg-white py-4 rounded-2xl items-center active:opacity-80 flex-row justify-center gap-2 ${
              (!canProceed || loading) ? 'opacity-50' : ''
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
