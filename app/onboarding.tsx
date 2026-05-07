import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingFlow } from '@/components/onboarding';
import { useApp } from '@/context/AppContext';

export default function OnboardingScreen() {
  const router = useRouter();
  const { goal, setGoal, wager, setWager, setOnboarded } = useApp();

  const handleComplete = () => {
    setOnboarded(true);
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <OnboardingFlow
        onComplete={handleComplete}
        goal={goal}
        setGoal={setGoal}
        wager={wager}
        setWager={setWager}
      />
    </View>
  );
}
