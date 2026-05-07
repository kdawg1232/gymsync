import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '@/context/AppContext';

export default function Index() {
  const { session, authLoading, profileLoading, profile } = useApp();

  if (authLoading || (session && profileLoading)) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator color="#F9C38E" size="large" />
      </View>
    );
  }

  // User is fully set up → go to main app
  if (session && profile) {
    return <Redirect href="/(tabs)" />;
  }

  // User has session but no profile → continue onboarding (mid-setup)
  if (session && !profile) {
    return <Redirect href="/onboarding" />;
  }

  // No session → show sign-in screen for returning users
  return <Redirect href="/sign-in" />;
}
