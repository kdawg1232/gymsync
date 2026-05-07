import { View, Text, Pressable } from 'react-native';
import { HeartPulse } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  onComplete: () => void;
}

export function Step13({ onComplete }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-center items-center px-4">
        <HeartPulse size={64} color={Colors.pastelRed} style={{ marginBottom: 32 }} />

        <Text className="text-4xl font-black text-white text-center leading-tight mb-6">
          Help us grow.
        </Text>
        <Text className="text-white/60 text-base text-center leading-relaxed mb-12 px-2">
          We're building this for couples like you. Allow notifications so we can send you nudges
          and updates.
        </Text>

        <View className="w-full gap-3">
          <Pressable
            onPress={onComplete}
            className="w-full bg-pastel-red py-4 rounded-2xl items-center active:opacity-80"
          >
            <Text className="text-white font-bold text-lg">Enable Notifications</Text>
          </Pressable>
          <Pressable onPress={onComplete} className="w-full py-4 rounded-2xl items-center">
            <Text className="text-white/40 font-bold text-base">Maybe Later</Text>
          </Pressable>
        </View>
      </View>

      <View className="w-full pb-12 items-center">
        <Text className="text-white/30 text-xs text-center">
          By finishing, you agree to our Terms & Privacy Policy.
        </Text>
      </View>
    </View>
  );
}
