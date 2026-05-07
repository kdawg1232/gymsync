import { View, Text, Pressable } from 'react-native';
import { ArrowRight, Users } from 'lucide-react-native';

interface Props {
  nextStep: () => void;
}

export function Step1({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center pt-16 w-full">
      <View className="flex-1 w-full max-w-sm justify-center px-4">
        <Text className="text-3xl font-black text-white text-center leading-tight mb-16 px-4">
          Success is <Text className="text-pastel-orange">3x more likely</Text> when shared.
        </Text>

        <View className="relative w-full h-64 items-center justify-center mb-16">
          <View className="absolute left-4 top-1/2 -translate-y-1/2 items-center gap-3">
            <View className="w-4 h-4 rounded-full bg-white/20" />
            <Text className="text-[10px] uppercase font-bold text-white/40 tracking-widest text-center w-16">
              Solo Effort
            </Text>
          </View>

          <View className="absolute left-24">
            <ArrowRight size={24} color="rgba(255,255,255,0.1)" />
          </View>

          <View className="absolute right-4 top-1/2 -translate-y-1/2 items-center gap-3">
            <View className="w-40 h-40 rounded-full bg-pastel-orange items-center justify-center overflow-hidden">
              <Users size={64} color="#fff" />
            </View>
            <Text className="text-[10px] uppercase font-bold text-pastel-orange tracking-widest">
              Partner Multiplier
            </Text>
          </View>
        </View>

        <Text className="text-white/50 text-sm text-center leading-relaxed px-4">
          Tracking with a partner creates a "social contract" that naturally boosts dopamine and consistency.
        </Text>
      </View>

      <View className="w-full pb-8 pt-4 max-w-sm px-4">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">The Science Checks Out</Text>
        </Pressable>
      </View>
    </View>
  );
}
