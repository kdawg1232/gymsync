import { View, Text, Pressable } from 'react-native';
import { Scale, ArrowRight, RefreshCw } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

export function Step7({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center w-full">
      <View className="flex-1 w-full max-w-sm justify-start px-4">
        <Text className="text-3xl font-black text-white text-center leading-tight mb-2">
          The Rules of the Game.
        </Text>
        <Text className="text-pastel-blue text-sm text-center mb-12">
          Accountability only works if it's fair.
        </Text>

        <View className="gap-4 w-full">
          <View className="bg-[#1A1A1A] p-5 rounded-3xl flex-row items-center gap-4 border border-white/5 overflow-hidden">
            <View className="absolute left-0 top-0 bottom-0 w-1 bg-pastel-green" />
            <View className="w-12 h-12 rounded-2xl bg-pastel-green/20 items-center justify-center">
              <Scale size={24} color={Colors.pastelGreen} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg text-white leading-tight mb-1">Double Win</Text>
              <Text className="text-white/50 text-xs">Both hit the goal. No one pays.</Text>
            </View>
          </View>

          <View className="bg-[#1A1A1A] p-5 rounded-3xl flex-row items-center gap-4 border border-white/5 overflow-hidden">
            <View className="absolute left-0 top-0 bottom-0 w-1 bg-pastel-orange" />
            <View className="w-12 h-12 rounded-2xl bg-pastel-orange/20 items-center justify-center">
              <ArrowRight size={24} color={Colors.pastelOrange} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg text-white leading-tight mb-1">Friendly Debt</Text>
              <Text className="text-white/50 text-xs">One misses. They owe the reward.</Text>
            </View>
          </View>

          <View className="bg-[#1A1A1A] p-5 rounded-3xl flex-row items-center gap-4 border border-white/5 overflow-hidden opacity-60">
            <View className="absolute left-0 top-0 bottom-0 w-1 bg-pastel-red" />
            <View className="w-12 h-12 rounded-2xl bg-pastel-red/20 items-center justify-center">
              <RefreshCw size={24} color={Colors.pastelRed} style={{ opacity: 0.5 }} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg text-white leading-tight mb-1">Shared Setback</Text>
              <Text className="text-white/50 text-xs">
                Both miss. No one pays, but the streak dies.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="w-full pt-4 pb-2 mb-5 max-w-sm px-4 self-center">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">Got It</Text>
        </Pressable>
      </View>
    </View>
  );
}
