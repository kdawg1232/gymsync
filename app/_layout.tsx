import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import { AppProvider, useApp } from '@/context/AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../global.css';

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, authLoading, profile, profileLoading } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (session && profileLoading) return;

    const inTabs = segments[0] === '(tabs)';
    const inSignIn = segments[0] === 'sign-in';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && inTabs) {
      router.replace('/sign-in');
      hasNavigated.current = true;
    } else if (session && profile && (inSignIn || inOnboarding)) {
      router.replace('/(tabs)');
      hasNavigated.current = true;
    }
  }, [session, authLoading, profile, profileLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand: Quicksand_400Regular,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="sign-in" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          </Stack>
        </AuthGuard>
      </AppProvider>
    </SafeAreaProvider>
  );
}
