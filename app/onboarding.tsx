import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingFlow } from '@/components/onboarding';
import { useApp } from '@/context/AppContext';
import { createPact } from '@/lib/database';

export default function OnboardingScreen() {
  const router = useRouter();
  const {
    user,
    onboardingGoal,
    setOnboardingGoal,
    onboardingWager,
    setOnboardingWager,
    onboardingName,
    setOnboardingName,
    refreshProfile,
    refreshPact,
  } = useApp();

  const handleComplete = async () => {
    try {
      if (user) {
        const placeholder = user.id;
        await createPact(placeholder, placeholder, onboardingGoal, onboardingWager);
        await refreshProfile();
        await refreshPact();
      }
    } catch (e) {
      console.warn('Error creating initial pact:', e);
    }
    router.replace('/(tabs)');
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <OnboardingFlow
        onComplete={handleComplete}
        onSignIn={handleSignIn}
        goal={onboardingGoal}
        setGoal={setOnboardingGoal}
        wager={onboardingWager}
        setWager={setOnboardingWager}
        name={onboardingName}
        setName={setOnboardingName}
      />
    </View>
  );
}
