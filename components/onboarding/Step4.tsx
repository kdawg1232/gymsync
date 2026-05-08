import { View, Text, Pressable } from 'react-native';
import { Coffee, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Props {
  nextStep: () => void;
}

export function Step4({ nextStep }: Props) {
  return (
    <View className="flex-1 items-center w-full">
      <View className="flex-1 w-full max-w-sm justify-center px-4">
        <View className="mb-12">
          <Text className="text-3xl font-black text-white text-center leading-tight">
            Miss your goal?{'\n'}
            <Text className="text-pastel-red">You owe.</Text>
          </Text>
          <Text className="text-pastel-blue text-sm text-center mt-3 leading-relaxed px-2">
            A friendly wager makes every workout count.{'\n'}The winner picks — the loser pays up.
          </Text>
        </View>

        <View className="gap-4">
          {/* Winner scenario */}
          <View className="bg-[#1A1A1A] rounded-2xl border border-pastel-green/20 p-5">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-2 h-2 rounded-full bg-pastel-green" />
              <Text className="text-[10px] text-pastel-green uppercase tracking-widest font-bold">
                You Win
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="text-white text-sm font-medium">
                  You hit <Text className="text-pastel-green font-bold">3/3</Text> — they hit{' '}
                  <Text className="text-pastel-red font-bold">2/3</Text>
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2 mt-3 bg-pastel-green/10 rounded-xl py-2.5 px-4">
              <ArrowRight size={12} color={Colors.pastelGreen} />
              <Text className="text-pastel-green text-xs font-bold">Partner owes you</Text>
              <Coffee size={14} color={Colors.pastelGreen} />
              <Text className="text-pastel-green text-xs font-bold">1 Coffee</Text>
            </View>
          </View>

          {/* Loser scenario */}
          <View className="bg-[#1A1A1A] rounded-2xl border border-pastel-red/20 p-5">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-2 h-2 rounded-full bg-pastel-red" />
              <Text className="text-[10px] text-pastel-red uppercase tracking-widest font-bold">
                You Lose
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="text-white text-sm font-medium">
                  You hit <Text className="text-pastel-red font-bold">2/3</Text> — they hit{' '}
                  <Text className="text-pastel-green font-bold">3/3</Text>
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2 mt-3 bg-pastel-red/10 rounded-xl py-2.5 px-4">
              <ArrowRight size={12} color={Colors.pastelRed} />
              <Text className="text-pastel-red text-xs font-bold">You owe partner</Text>
              <Coffee size={14} color={Colors.pastelRed} />
              <Text className="text-pastel-red text-xs font-bold">1 Coffee</Text>
            </View>
          </View>
        </View>

        <Text className="text-white/45 text-xs text-center mt-6 italic">
          You'll pick your own wager in a moment.
        </Text>
      </View>

      <View className="w-full pt-4 pb-2 mb-12 max-w-sm px-4 self-center">
        <Pressable
          onPress={nextStep}
          className="w-full bg-white py-4 rounded-2xl items-center active:opacity-80"
        >
          <Text className="text-black font-bold text-lg">That's the deal</Text>
        </Pressable>
      </View>
    </View>
  );
}
