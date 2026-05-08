import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { HeartPulse } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { registerForPushNotifications, scheduleWorkoutReminder, scheduleWeeklySummary } from '@/lib/notifications';
import { useApp } from '@/context/AppContext';

interface Props {
  onComplete: () => void;
}

export function Step13({ onComplete }: Props) {
  const { user } = useApp();
  const [enabling, setEnabling] = useState(false);

  const enableNotifications = async () => {
    setEnabling(true);
    try {
      if (user) {
        await registerForPushNotifications(user.id);
        await scheduleWorkoutReminder(9, 0);
        await scheduleWeeklySummary();
      }
    } catch (e) {
      console.warn('Notification setup error:', e);
    } finally {
      setEnabling(false);
      onComplete();
    }
  };

  return (
    <View className="flex-1 items-center w-full justify-between">
      <View className="flex-1 w-full max-w-sm justify-center items-center px-4 pb-6">
        <HeartPulse size={64} color={Colors.pastelRed} style={{ marginBottom: 24 }} />

        <Text className="text-4xl font-black text-white text-center leading-tight mb-6">
          Help us grow.
        </Text>
        <Text className="text-pastel-blue text-base text-center leading-relaxed mb-8 px-2">
          We're building this for couples like you. Allow notifications so we can send you nudges
          and updates.
        </Text>

        <View className="w-full gap-3">
          <Pressable
            onPress={enableNotifications}
            disabled={enabling}
            className="w-full bg-pastel-red py-4 rounded-2xl items-center active:opacity-80 flex-row justify-center gap-2"
          >
            {enabling && <ActivityIndicator color="#fff" size="small" />}
            <Text className="text-white font-bold text-lg">
              {enabling ? 'Setting up...' : 'Enable Notifications'}
            </Text>
          </Pressable>
          <Pressable onPress={onComplete} className="w-full py-4 rounded-2xl items-center">
            <Text className="text-white/50 font-bold text-base">Maybe Later</Text>
          </Pressable>
        </View>
      </View>

      <View className="w-full pt-2 pb-2 mb-12 items-center px-4 self-center">
        <Text className="text-white/40 text-xs text-center">
          By finishing, you agree to our Terms & Privacy Policy.
        </Text>
      </View>
    </View>
  );
}
