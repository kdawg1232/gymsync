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

  if (session && profile) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
